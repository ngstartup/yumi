#!/usr/bin/env python3
"""
Enregistre l'audio des exercices d'écoute.

Pourquoi des fichiers plutôt que la synthèse vocale de l'appareil : sur un
téléphone Android, `speechSynthesis` de la WebView n'a aucune voix, et le
moteur vocal du système n'est ni toujours présent, ni toujours pourvu d'une
voix anglaise — un exercice de compréhension orale devient alors silencieux
sans le moindre message. Un enregistrement, lui, se joue partout, hors
connexion, et toujours avec la même voix : c'est aussi meilleur
pédagogiquement, l'apprenant reconnaît une prononciation de référence.

La voix vient de Kokoro (modèle `kokoro-multi-lang-v1_0` servi par
sherpa-onnx) : le rendu est nettement moins « robot » que celui des modèles
VITS mono-voix, ce qui compte quand l'apprenant écoute la même voix des
dizaines de fois. Le débit est volontairement en dessous du naturel — un
débutant n'entend pas les mots dans une phrase dite à pleine vitesse.

Le script est reproductible : mêmes textes, même voix, mêmes fichiers.

    python3 scripts/make-audio.py --model-dir /chemin/kokoro-multi-lang-v1_0

Il produit `public/audio/<id>.ogg` et l'index `src/audio/clips.ts`.
L'identifiant vient du texte lui-même (voir `clipId`, dupliqué à l'identique
dans `src/lib/audioClips.ts`) : ajouter une phrase au contenu et relancer le
script suffit, rien n'est à renommer à la main.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
import wave
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIO_DIR = ROOT / "public" / "audio"
INDEX_FILE = ROOT / "src" / "audio" / "clips.ts"

# De la parole, pas de la musique — mais de la parole qu'il faut pouvoir
# distinguer consonne par consonne, puisque c'est précisément l'exercice.
# Opus tient cette finesse à 24 kb/s là où il en faudrait plus du double en
# MP3 : les 722 extraits tiennent ainsi dans quelques mégaoctets, ce qui
# compte pour une mise à jour à distance payée en données mobiles.
# Voix et débit. `bf_emma` est une voix féminine britannique — la prononciation
# de référence de la charte — et 0,85 la place un cran sous le débit naturel :
# assez lent pour qu'un débutant sépare les mots, assez proche du naturel pour
# ne pas déformer l'intonation. Le bouton « écouter lentement » des dictées
# descend encore, à la lecture.
DEFAULT_SPEAKER = 21
DEFAULT_SPEED = 0.85

BITRATE = "24k"
CONTAINER = "ogg"

_tts = None
_sid = 21
_speed = 0.85


def normalize(text: str) -> str:
    return " ".join(text.split())


def clip_id(text: str) -> str:
    """FNV-1a puis djb2, sur les unités de code UTF-16 — même calcul en TypeScript."""
    s = normalize(text)
    h1 = 0x811C9DC5
    h2 = 5381
    for ch in s:
        c = ord(ch)
        h1 = ((h1 ^ c) * 16777619) & 0xFFFFFFFF
        h2 = ((h2 * 33) ^ c) & 0xFFFFFFFF
    return f"{h1:08x}{h2:08x}"


def _init(model_dir: str, sid: int, speed: float) -> None:
    global _tts, _sid, _speed
    import sherpa_onnx

    _sid, _speed = sid, speed
    _tts = sherpa_onnx.OfflineTts(
        sherpa_onnx.OfflineTtsConfig(
            model=sherpa_onnx.OfflineTtsModelConfig(
                kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(
                    model=f"{model_dir}/model.onnx",
                    voices=f"{model_dir}/voices.bin",
                    tokens=f"{model_dir}/tokens.txt",
                    data_dir=f"{model_dir}/espeak-ng-data",
                    dict_dir=f"{model_dir}/dict",
                    # Lexique britannique : c'est la prononciation de référence
                    # de la charte pédagogique.
                    lexicon=f"{model_dir}/lexicon-gb-en.txt,{model_dir}/lexicon-zh.txt",
                ),
                provider="cpu",
                num_threads=1,
            ),
            max_num_sentences=1,
        )
    )


def _render(job: tuple[str, str]) -> tuple[str, int]:
    """Synthétise puis encode un extrait. Renvoie (id, octets)."""
    import array

    text, cid = job
    out = AUDIO_DIR / f"{cid}.{CONTAINER}"
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        raw = tmp.name
    try:
        audio = _tts.generate(text, sid=_sid, speed=_speed)
        pcm = array.array(
            "h", (int(max(-1.0, min(1.0, s)) * 32767) for s in audio.samples)
        )
        with wave.open(raw, "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(audio.sample_rate)
            w.writeframes(pcm.tobytes())
        subprocess.run(
            [
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", raw,
                # Piper laisse un silence en tête et en queue : on le rogne, sinon
                # chaque écoute commence par un temps mort.
                "-af",
                "silenceremove=start_periods=1:start_silence=0.04:start_threshold=-45dB,"
                "areverse,"
                "silenceremove=start_periods=1:start_silence=0.10:start_threshold=-45dB,"
                "areverse,"
                "loudnorm=I=-16:TP=-1.5:LRA=11",
                "-ac", "1", "-codec:a", "libopus", "-b:a", BITRATE,
                "-application", "audio", "-vbr", "on", str(out),
            ],
            check=True,
        )
    finally:
        os.unlink(raw)
    return cid, out.stat().st_size


def collect_strings() -> list[str]:
    """Inventaire des textes à enregistrer, via le collecteur TypeScript."""
    bundle = Path(tempfile.gettempdir()) / "yumi-audio-strings.cjs"
    subprocess.run(
        [
            "npx", "esbuild", "scripts/collect-audio-strings.ts", "--bundle",
            "--platform=node", "--format=cjs", "--alias:@=./src",
            f"--outfile={bundle}", "--log-level=error",
        ],
        cwd=ROOT, check=True,
    )
    raw = subprocess.run(["node", str(bundle)], cwd=ROOT, check=True, capture_output=True)
    return json.loads(raw.stdout)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--model-dir", required=True,
                    help="dossier du modèle kokoro-multi-lang-v1_0")
    ap.add_argument("--speaker", type=int, default=DEFAULT_SPEAKER,
                    help=f"identifiant de voix Kokoro (défaut {DEFAULT_SPEAKER} = bf_emma)")
    ap.add_argument("--speed", type=float, default=DEFAULT_SPEED,
                    help="1.0 = débit naturel ; en dessous, plus lent")
    ap.add_argument("--jobs", type=int, default=max(1, (os.cpu_count() or 2)))
    ap.add_argument("--clean", action="store_true", help="repart d'un dossier vide")
    args = ap.parse_args()

    model = Path(args.model_dir)
    if not (model / "model.onnx").exists():
        print(f"modèle introuvable : {model}/model.onnx", file=sys.stderr)
        return 1
    if shutil.which("ffmpeg") is None:
        print("ffmpeg est requis", file=sys.stderr)
        return 1

    texts = collect_strings()
    print(f"{len(texts)} textes à enregistrer")

    if args.clean and AUDIO_DIR.exists():
        shutil.rmtree(AUDIO_DIR)
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    ids: dict[str, str] = {}
    for t in texts:
        cid = clip_id(t)
        if cid in ids and ids[cid] != t:
            print(f"collision d'identifiant entre {ids[cid]!r} et {t!r}", file=sys.stderr)
            return 1
        ids[cid] = t

    todo = [(t, clip_id(t)) for t in texts if not (AUDIO_DIR / f"{clip_id(t)}.{CONTAINER}").exists()]
    print(f"{len(todo)} à produire ({len(texts) - len(todo)} déjà présents)")

    done = 0
    if todo:
        with ProcessPoolExecutor(
            max_workers=args.jobs,
            initializer=_init,
            initargs=(str(model), args.speaker, args.speed),
        ) as pool:
            for cid, size in pool.map(_render, todo, chunksize=4):
                done += 1
                if done % 50 == 0 or done == len(todo):
                    print(f"  {done}/{len(todo)}", flush=True)

    # Ménage : un extrait dont le texte a disparu du contenu n'a plus lieu d'être.
    keep = set(ids)
    removed = 0
    for f in AUDIO_DIR.glob(f"*.{CONTAINER}"):
        if f.stem not in keep:
            f.unlink()
            removed += 1

    total = sum(f.stat().st_size for f in AUDIO_DIR.glob(f"*.{CONTAINER}"))
    INDEX_FILE.parent.mkdir(parents=True, exist_ok=True)
    listing = "\n".join(f"  '{cid}'," for cid in sorted(keep))
    INDEX_FILE.write_text(
        "/* Fichier généré par scripts/make-audio.py — ne pas modifier à la main.\n"
        " *\n"
        " * Identifiants des extraits présents dans public/audio/. L'application\n"
        " * calcule l'identifiant d'un texte puis consulte cette liste : elle sait\n"
        " * ainsi, sans requête réseau, si elle dispose de l'enregistrement ou si\n"
        " * elle doit se rabattre sur la synthèse vocale de l'appareil. */\n\n"
        f"export const CLIP_IDS: ReadonlySet<string> = new Set([\n{listing}\n]);\n",
        encoding="utf-8",
    )

    print(f"{len(keep)} extraits · {total / 1_048_576:.2f} Mo · {removed} supprimés")
    print(f"index écrit dans {INDEX_FILE.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
