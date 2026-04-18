import { Link } from '@inertiajs/react';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import useTranslations from '@/hooks/useTranslations';

function Logo({ className = 'h-8 w-8' }) {
    return (
        <svg
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <circle cx="16" cy="16" r="4" fill="#ffffff" />
            <circle cx="5" cy="6" r="2.5" fill="#ffffff" opacity="0.85" />
            <circle cx="27" cy="6" r="2.5" fill="#ffffff" opacity="0.85" />
            <circle cx="27" cy="26" r="2.5" fill="#ffffff" opacity="0.85" />
            <circle cx="5" cy="26" r="2.5" fill="#ffffff" opacity="0.85" />
            <circle cx="16" cy="2.5" r="1.8" fill="#ffffff" opacity="0.7" />
            <path
                d="M16 16 L5 6 M16 16 L27 6 M16 16 L27 26 M16 16 L5 26 M16 16 L16 2.5"
                stroke="#ffffff"
                strokeWidth="1.2"
                opacity="0.5"
                fill="none"
            />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path
                fillRule="evenodd"
                d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z"
                clipRule="evenodd"
            />
        </svg>
    );
}

export default function GuestLayout({ children, title, subtitle }) {
    const { t } = useTranslations();

    const bullets = [
        t('auth.panel.bullet_1'),
        t('auth.panel.bullet_2'),
        t('auth.panel.bullet_3'),
        t('auth.panel.bullet_4'),
    ];

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
            {/* Left panel (hidden on small screens) */}
            <aside className="relative hidden w-1/2 overflow-hidden bg-slate-900 lg:block">
                <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-indigo-600/25 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl" />

                <div className="relative flex h-full flex-col justify-between p-10 text-white">
                    <Link href="/" className="flex items-center gap-2">
                        <Logo className="h-8 w-8" />
                        <span className="text-lg font-semibold">
                            {t('app.name')}
                        </span>
                    </Link>

                    <div className="max-w-md">
                        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
                            {t('auth.panel.heading_1')}
                            <br />
                            <span className="text-indigo-300">
                                {t('auth.panel.heading_2')}
                            </span>
                        </h1>
                        <p className="mt-4 text-sm text-slate-300">
                            {t('auth.panel.subtitle')}
                        </p>

                        <ul className="mt-8 space-y-3 text-sm text-slate-200">
                            {bullets.map((b) => (
                                <li
                                    key={b}
                                    className="flex items-start gap-2.5"
                                >
                                    <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white">
                                        <CheckIcon />
                                    </span>
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="text-xs text-slate-400">
                        © {new Date().getFullYear()} {t('app.name')}
                    </div>
                </div>
            </aside>

            {/* Right panel */}
            <main className="flex w-full flex-col items-stretch bg-slate-50 text-slate-800 lg:w-1/2">
                <div className="flex items-center justify-between px-6 pt-6 sm:px-10">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-slate-700 lg:hidden"
                    >
                        <Logo className="h-7 w-7" />
                        <span className="text-base font-semibold">
                            {t('app.name')}
                        </span>
                    </Link>
                    <div className="ml-auto">
                        <LanguageSwitcher variant="light" />
                    </div>
                </div>

                <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10 sm:px-10">
                    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-slate-800 shadow-xl sm:p-10">
                        {(title || subtitle) && (
                            <div className="mb-6">
                                {title && (
                                    <h2 className="text-2xl font-semibold text-slate-900">
                                        {title}
                                    </h2>
                                )}
                                {subtitle && (
                                    <p className="mt-1 text-sm text-slate-500">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        )}
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
