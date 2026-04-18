import { usePage } from '@inertiajs/react';

/**
 * Tiny translation helper that reads flat key/value translations
 * shared by the Laravel backend via Inertia.
 *
 * Usage:
 *   const { t, locale, supportedLocales } = useTranslations();
 *   t('nav.dashboard')
 *   t('projects.delete_confirm', { topic: project.topic })
 */
export default function useTranslations() {
    const { props } = usePage();

    const translations =
        (props && typeof props.translations === 'object' && props.translations) ||
        {};
    const locale = (props && props.locale) || 'en';
    const supportedLocales = (props && props.supported_locales) || ['en', 'de'];

    const t = (key, replacements = {}) => {
        const raw =
            typeof translations[key] === 'string' ? translations[key] : key;
        if (!replacements || typeof replacements !== 'object') {
            return raw;
        }
        return Object.entries(replacements).reduce(
            (acc, [name, value]) =>
                acc.replace(new RegExp(`\\{\\s*${name}\\s*\\}`, 'g'), value),
            raw,
        );
    };

    return { t, locale, supportedLocales, translations };
}
