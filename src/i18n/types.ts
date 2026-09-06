export type DeepPartial<T> = T extends readonly (infer U)[]
  ? readonly DeepPartial<U>[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

export const SUPPORTED_LOCALES = ['fr', 'en', 'ar', 'es', 'pt'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** Locales with a dictionary shipped today. The others are declared so the
 *  architecture (routing, settings, RTL) is ready before the translations land. */
export const AVAILABLE_LOCALES: Locale[] = ['fr', 'en'];

export const RTL_LOCALES: Locale[] = ['ar'];
