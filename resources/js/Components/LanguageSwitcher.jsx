import { useEffect, useRef, useState } from 'react';
import useTranslations from '@/hooks/useTranslations';

const LANGUAGE_META = {
    en: { label: 'English', short: 'EN', flag: '🇬🇧' },
    de: { label: 'Deutsch', short: 'DE', flag: '🇩🇪' },
};

/**
 * Small dropdown for switching the UI locale.
 * Posts to /locale and preserves the current page after the switch.
 *
 * variant:
 *   - "dark" (default): for dark nav (landing / auth panel)
 *   - "light": for white nav (authenticated layout)
 */
export default function LanguageSwitcher({ variant = 'dark' }) {
    const { locale, supportedLocales, t } = useTranslations();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const switchTo = (newLocale) => {
        setOpen(false);
        if (newLocale === locale) return;
        if (typeof window === 'undefined') return;

        // Set a client-side cookie immediately as an extra safety net — even if
        // the network request fails, the next full reload will read this cookie.
        // 1 year, root path, SameSite=Lax so it survives cross-page navigation.
        const oneYear = 60 * 60 * 24 * 365;
        document.cookie = `locale=${newLocale}; Max-Age=${oneYear}; Path=/; SameSite=Lax`;

        // Full-page GET navigation to the locale route. Bypasses CSRF, sessions,
        // and XHR — works on any hosting, even when Inertia POST is blocked.
        window.location.href = `/locale/${newLocale}`;
    };

    const current = LANGUAGE_META[locale] || LANGUAGE_META.en;

    const triggerClasses =
        variant === 'light'
            ? 'inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50'
            : 'inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:bg-white/10';

    const menuClasses =
        variant === 'light'
            ? 'absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg'
            : 'absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-lg border border-white/10 bg-slate-900 shadow-lg';

    const itemClasses = (active) =>
        variant === 'light'
            ? `flex w-full items-center justify-between px-3 py-2 text-sm ${
                  active
                      ? 'bg-gray-100 font-semibold text-gray-900'
                      : 'text-gray-700 hover:bg-gray-50'
              }`
            : `flex w-full items-center justify-between px-3 py-2 text-sm ${
                  active
                      ? 'bg-white/10 font-semibold text-white'
                      : 'text-slate-200 hover:bg-white/5'
              }`;

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={t('nav.language')}
                className={triggerClasses}
            >
                <span aria-hidden="true">{current.flag}</span>
                <span>{current.short}</span>
                <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-3.5 w-3.5 opacity-70"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            {open && (
                <ul role="listbox" className={menuClasses}>
                    {supportedLocales.map((code) => {
                        const meta = LANGUAGE_META[code] || {
                            label: code.toUpperCase(),
                            short: code.toUpperCase(),
                            flag: '🌐',
                        };
                        const active = code === locale;
                        return (
                            <li key={code}>
                                <button
                                    type="button"
                                    onClick={() => switchTo(code)}
                                    className={itemClasses(active)}
                                    role="option"
                                    aria-selected={active}
                                >
                                    <span className="flex items-center gap-2">
                                        <span aria-hidden="true">
                                            {meta.flag}
                                        </span>
                                        <span>{meta.label}</span>
                                    </span>
                                    {active && (
                                        <svg
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            className="h-3.5 w-3.5"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
