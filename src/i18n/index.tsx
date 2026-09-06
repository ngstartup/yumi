import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { fr, type Dictionary } from './fr';
import { en } from './en';
import { AVAILABLE_LOCALES, RTL_LOCALES, type Locale } from './types';

const DICTIONARIES: Record<string, unknown> = { fr, en };

/** Deep-merge a partial dictionary over the French base. */
function merge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (typeof base !== 'object' || base === null || Array.isArray(base)) return override as T;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(override as Record<string, unknown>)) {
    out[k] = merge((base as Record<string, unknown>)[k], v);
  }
  return out as T;
}

function dictionaryFor(locale: Locale): Dictionary {
  if (locale === 'fr') return fr;
  return merge(fr, DICTIONARIES[locale] ?? {});
}

/** Dot-path lookup: t('lesson.correct'). Returns the path itself if missing,
 *  which makes a missing key obvious in dev without ever throwing. */
function lookup(dict: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, dict);
}

export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

export type TFunction = (path: string, vars?: Record<string, string | number>) => string;

interface I18nValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  dict: Dictionary;
  t: TFunction;
  dir: 'ltr' | 'rtl';
  available: Locale[];
}

const I18nContext = createContext<I18nValue | null>(null);

const STORAGE_KEY = 'yumi.locale';

function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (AVAILABLE_LOCALES as string[]).includes(saved)) return saved as Locale;
  } catch {
    /* storage unavailable — fall through */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : 'fr';
  return (AVAILABLE_LOCALES as string[]).includes(nav) ? (nav as Locale) : 'fr';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = l;
      document.documentElement.dir = RTL_LOCALES.includes(l) ? 'rtl' : 'ltr';
    }
  }, []);

  const value = useMemo<I18nValue>(() => {
    const dict = dictionaryFor(locale);
    const t: TFunction = (path, vars) => {
      const raw = lookup(dict, path);
      if (typeof raw === 'string') return interpolate(raw, vars);
      if (Array.isArray(raw) && raw.every((x) => typeof x === 'string')) return raw[0] as string;
      return path;
    };
    return {
      locale,
      setLocale,
      dict,
      t,
      dir: RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr',
      available: AVAILABLE_LOCALES,
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}

export function useT(): TFunction {
  return useI18n().t;
}

export type { Locale };
export { AVAILABLE_LOCALES };
