import es from './es.json';
import en from './en.json';

export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

const dictionaries = { es, en } satisfies Record<Locale, unknown>;
export type Dictionary = typeof es;

export function isLocale(valor: string | undefined): valor is Locale {
    return !!valor && (locales as readonly string[]).includes(valor);
}

export function getDictionary(lang: Locale): Dictionary {
    return dictionaries[lang];
}

export function localizedPath(lang: Locale, ruta = ''): string {
    const limpia = ruta.replace(/^\/+|\/+$/g, '');
    return limpia ? `/${lang}/${limpia}/` : `/${lang}/`;
}