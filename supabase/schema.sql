-- =============================================================================
-- Yumi — schéma relationnel (PostgreSQL / Supabase)
-- =============================================================================
-- Le MVP fonctionne en local-first (IndexedDB). Ce schéma est la cible cloud :
-- les noms de tables et de colonnes correspondent aux entités de src/data/schema.ts.
--
-- Exécuter dans le SQL editor de Supabase, puis renseigner
-- VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY côté application.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
do $$ begin
  create type cefr_level as enum ('A1','A2','B1','B2','C1','C2');
exception when duplicate_object then null; end $$;

do $$ begin
  create type skill_key as enum ('vocabulary','grammar','reading','listening','writing','speaking');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lesson_status as enum ('in_progress','completed');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 1. Identité — `users` est géré par Supabase Auth (auth.users)
-- ---------------------------------------------------------------------------

create table if not exists profiles (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  first_name    text not null,
  last_name     text default '',
  avatar_seed   text default '',
  locale        text not null default 'fr',
  goal          text not null default 'general',
  level         cefr_level not null default 'A1',
  active_track  text not null default 'general',
  daily_goal    text not null default 'regular',
  placement_done boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

do $$ begin
  create type haptic_intensity as enum ('light','medium','strong');
exception when duplicate_object then null; end $$;

create table if not exists user_settings (
  user_id               uuid primary key references auth.users(id) on delete cascade,
  notifications_enabled boolean not null default false,
  reminder_time         text not null default '19:00',
  -- Retour sensoriel : sons d'interface et vibrations, réglables séparément.
  sound_enabled         boolean not null default true,
  sound_volume          numeric(3,2) not null default 0.60 check (sound_volume between 0 and 1),
  haptics_enabled       boolean not null default true,
  haptics_intensity     haptic_intensity not null default 'medium',
  analytics_opt_in      boolean not null default false,
  updated_at            timestamptz not null default now()
);

-- Migration d'une base existante (colonnes ajoutées après le MVP initial) :
alter table user_settings add column if not exists sound_volume numeric(3,2) not null default 0.60;
alter table user_settings add column if not exists haptics_enabled boolean not null default true;
alter table user_settings add column if not exists haptics_intensity haptic_intensity not null default 'medium';

-- ---------------------------------------------------------------------------
-- 2. Contenu pédagogique (administrable, jamais codé en dur côté client)
-- ---------------------------------------------------------------------------

create table if not exists courses (
  id          text primary key,
  name        text not null,
  description text default '',
  created_at  timestamptz not null default now()
);

create table if not exists tracks (
  id          text primary key,
  course_id   text references courses(id) on delete cascade,
  name        text not null,
  tagline     text default '',
  description text default '',
  icon        text default '',
  position    int not null default 0
);

create table if not exists levels (
  id        text primary key,
  track_id  text not null references tracks(id) on delete cascade,
  level     cefr_level not null,
  position  int not null default 0
);

create table if not exists sections (
  id        text primary key,
  level_id  text not null references levels(id) on delete cascade,
  title     text not null,
  position  int not null default 0
);

create table if not exists units (
  id         text primary key,
  section_id text not null references sections(id) on delete cascade,
  title      text not null,
  subtitle   text default '',
  icon       text default '',
  position   int not null default 0
);

create table if not exists lessons (
  id                text primary key,
  unit_id           text not null references units(id) on delete cascade,
  title             text not null,
  objective         text default '',
  intro             text default '',
  note              jsonb,
  difficulty        int not null default 1 check (difficulty between 1 and 5),
  target_exercises  int not null default 8,
  estimated_minutes int not null default 5,
  position          int not null default 0
);

create table if not exists skills (
  id    skill_key primary key,
  label text not null
);

create table if not exists grammar_topics (
  id          text primary key,
  title       text not null,
  rule        text not null,
  level       cefr_level not null default 'A1'
);

create table if not exists vocabulary (
  id         text primary key,
  lesson_id  text references lessons(id) on delete cascade,
  en         text not null,
  fr         text not null,
  pos        text,
  example_en text,
  example_fr text,
  difficulty int not null default 1 check (difficulty between 1 and 5)
);

create table if not exists exercises (
  id            text primary key,
  lesson_id     text not null references lessons(id) on delete cascade,
  type          text not null,
  concept_id    text not null,
  skill         skill_key not null,
  difficulty    int not null default 1 check (difficulty between 1 and 5),
  instruction   text not null,
  payload       jsonb not null,
  explanation   text default '',
  position      int not null default 0
);

create table if not exists exercise_options (
  id          bigserial primary key,
  exercise_id text not null references exercises(id) on delete cascade,
  label       text not null,
  is_correct  boolean not null default false,
  position    int not null default 0
);

-- ---------------------------------------------------------------------------
-- 3. Progression de l'apprenant
-- ---------------------------------------------------------------------------

create table if not exists user_progress (
  id             bigserial primary key,
  user_id        uuid not null references auth.users(id) on delete cascade,
  track_id       text not null,
  started_at     timestamptz not null default now(),
  last_lesson_id text,
  updated_at     timestamptz not null default now(),
  unique (user_id, track_id)
);

create table if not exists lesson_progress (
  id              bigserial primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  lesson_id       text not null,
  unit_id         text not null,
  track_id        text not null,
  status          lesson_status not null default 'in_progress',
  best_accuracy   numeric(5,2) not null default 0,
  times_completed int not null default 0,
  last_score      numeric(5,2) not null default 0,
  total_time_ms   bigint not null default 0,
  completed_at    timestamptz,
  updated_at      timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists exercise_attempts (
  id            bigserial primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  lesson_id     text not null,
  exercise_id   text not null,
  concept_id    text not null,
  exercise_type text not null,
  skill         skill_key not null,
  correct       boolean not null,
  near_miss     boolean not null default false,
  answer        text default '',
  duration_ms   int not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists idx_attempts_user_created on exercise_attempts(user_id, created_at desc);

-- Mémoire de répétition espacée, une ligne par notion et par apprenant.
create table if not exists concept_memory (
  id               bigserial primary key,
  user_id          uuid not null references auth.users(id) on delete cascade,
  concept_id       text not null,
  lesson_id        text,
  skill            skill_key not null default 'vocabulary',
  ease             numeric(4,3) not null default 2.400,
  interval_days    int not null default 0,
  repetitions      int not null default 0,
  lapses           int not null default 0,
  attempts         int not null default 0,
  correct          int not null default 0,
  last_reviewed_at timestamptz not null default now(),
  due_at           timestamptz not null default now(),
  unique (user_id, concept_id)
);
create index if not exists idx_memory_due on concept_memory(user_id, due_at);

-- ---------------------------------------------------------------------------
-- 4. Gamification
-- ---------------------------------------------------------------------------

create table if not exists daily_goals (
  id                 bigserial primary key,
  user_id            uuid not null references auth.users(id) on delete cascade,
  day                date not null,
  xp                 int not null default 0,
  lessons_completed  int not null default 0,
  exercises_answered int not null default 0,
  correct_answers    int not null default 0,
  time_ms            bigint not null default 0,
  goal_xp            int not null default 30,
  goal_reached       boolean not null default false,
  unique (user_id, day)
);

create table if not exists streaks (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  current          int not null default 0,
  best             int not null default 0,
  last_active_day  date,
  history          jsonb not null default '[]'::jsonb,
  updated_at       timestamptz not null default now()
);

create table if not exists xp_transactions (
  id         bigserial primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  amount     int not null,
  reason     text not null,
  lesson_id  text,
  day        date not null default current_date,
  created_at timestamptz not null default now()
);
create index if not exists idx_xp_user_day on xp_transactions(user_id, day);

create table if not exists badges (
  id          text primary key,
  emoji       text default '',
  tone        text default 'blue',
  i18n_key    text not null
);

create table if not exists user_badges (
  id        bigserial primary key,
  user_id   uuid not null references auth.users(id) on delete cascade,
  badge_id  text not null references badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

create table if not exists certificates (
  id            text primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  track_id      text not null,
  level         cefr_level not null,
  overall_score numeric(5,2) not null,
  skill_scores  jsonb not null default '{}'::jsonb,
  full_name     text not null,
  issued_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5. Hors connexion
-- ---------------------------------------------------------------------------

create table if not exists offline_content (
  id            bigserial primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  unit_id       text not null,
  track_id      text not null,
  downloaded_at timestamptz not null default now(),
  size_estimate int not null default 0,
  unique (user_id, unit_id)
);

-- ---------------------------------------------------------------------------
-- 6. Architecture sociale future (modèles créés, fonctionnalités non activées)
-- ---------------------------------------------------------------------------

create table if not exists friendships (
  id          bigserial primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  friend_id   uuid not null references auth.users(id) on delete cascade,
  status      text not null default 'pending',
  created_at  timestamptz not null default now(),
  unique (user_id, friend_id)
);

create table if not exists groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  owner_id   uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists group_members (
  group_id uuid not null references groups(id) on delete cascade,
  user_id  uuid not null references auth.users(id) on delete cascade,
  role     text not null default 'member',
  primary key (group_id, user_id)
);

-- ---------------------------------------------------------------------------
-- 7. Row Level Security — chacun ne voit que ses données
-- ---------------------------------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','user_settings','user_progress','lesson_progress','exercise_attempts',
    'concept_memory','daily_goals','streaks','xp_transactions','user_badges',
    'certificates','offline_content','friendships'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "own rows select" on %I', t);
    execute format('drop policy if exists "own rows write" on %I', t);
    execute format(
      'create policy "own rows select" on %I for select using (auth.uid() = user_id)', t);
    execute format(
      'create policy "own rows write" on %I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
  end loop;
end $$;

-- Le contenu pédagogique est public en lecture, écriture réservée au service role.
do $$
declare t text;
begin
  foreach t in array array[
    'courses','tracks','levels','sections','units','lessons','skills',
    'grammar_topics','vocabulary','exercises','exercise_options','badges'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "public read" on %I', t);
    execute format('create policy "public read" on %I for select using (true)', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 8. Données de référence
-- ---------------------------------------------------------------------------

insert into skills (id, label) values
  ('vocabulary','Vocabulaire'), ('grammar','Grammaire'), ('reading','Lecture'),
  ('listening','Écoute'), ('writing','Écrit'), ('speaking','Oral')
on conflict (id) do nothing;

insert into badges (id, emoji, tone, i18n_key) values
  ('first-lesson','🌱','mint','firstLesson'),
  ('xp-100','⚡','sun','xp100'),
  ('xp-1000','🔋','sun','xp1000'),
  ('streak-7','🔥','sun','streak7'),
  ('streak-30','🏔️','blue','streak30'),
  ('first-unit','🧩','blue','firstUnit'),
  ('level-a1','🎯','mint','levelA1'),
  ('exercises-100','💯','blue','exercises100'),
  ('words-500','📚','blue','words500'),
  ('first-assessment','🏅','sun','firstAssessment'),
  ('perfect-lesson','✨','mint','perfectLesson'),
  ('early-bird','🌅','sun','earlyBird'),
  ('night-owl','🌙','blue','nightOwl')
on conflict (id) do nothing;
