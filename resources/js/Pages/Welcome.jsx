import { Head, Link } from '@inertiajs/react';
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
            <circle cx="16" cy="16" r="4" fill="#6366f1" />
            <circle cx="5" cy="6" r="2.5" fill="#6366f1" opacity="0.85" />
            <circle cx="27" cy="6" r="2.5" fill="#6366f1" opacity="0.85" />
            <circle cx="27" cy="26" r="2.5" fill="#6366f1" opacity="0.85" />
            <circle cx="5" cy="26" r="2.5" fill="#6366f1" opacity="0.85" />
            <circle cx="16" cy="2.5" r="1.8" fill="#6366f1" opacity="0.7" />
            <path
                d="M16 16 L5 6 M16 16 L27 6 M16 16 L27 26 M16 16 L5 26 M16 16 L16 2.5"
                stroke="#6366f1"
                strokeWidth="1.2"
                opacity="0.5"
                fill="none"
            />
        </svg>
    );
}

function featureIcons() {
    return {
        f1: (
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path
                    d="M12 3v18M3 12h18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        ),
        f2: (
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path
                    d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.3-1.5 1-1.5 1.9V14M12 17h.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        ),
        f3: (
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path
                    d="M4 6h16M4 12h10M4 18h7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        ),
        f4: (
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path
                    d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
            </svg>
        ),
        f5: (
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path
                    d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ),
        f6: (
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path
                    d="M12 8v4l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        ),
    };
}

export default function Welcome({ auth }) {
    const { t } = useTranslations();
    const icons = featureIcons();

    const features = [
        { key: 'f1', icon: icons.f1 },
        { key: 'f2', icon: icons.f2 },
        { key: 'f3', icon: icons.f3 },
        { key: 'f4', icon: icons.f4 },
        { key: 'f5', icon: icons.f5 },
        { key: 'f6', icon: icons.f6 },
    ];

    const steps = ['s1', 's2', 's3', 's4'];
    const faqs = ['q1', 'q2', 'q3', 'q4'];

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
            <Head title={t('app.name')} />

            {/* Decorative background — solid colored blurs, no gradients */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -left-24 top-24 h-80 w-80 rounded-full bg-indigo-700/30 blur-3xl" />
                <div className="absolute right-0 top-48 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
                <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
            </div>

            {/* Nav */}
            <header className="relative z-40 border-b border-white/5">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-white"
                    >
                        <Logo className="h-8 w-8" />
                        <span className="text-lg font-semibold">
                            {t('app.name')}
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
                        <a
                            href="#features"
                            className="transition hover:text-white"
                        >
                            {t('nav.features')}
                        </a>
                        <a
                            href="#how"
                            className="transition hover:text-white"
                        >
                            {t('nav.how_it_works')}
                        </a>
                        <a href="#faq" className="transition hover:text-white">
                            {t('nav.faq')}
                        </a>
                    </nav>

                    <div className="flex items-center gap-3">
                        <LanguageSwitcher variant="dark" />

                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-500"
                            >
                                {t('nav.dashboard')}
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="hidden text-sm font-medium text-slate-300 transition hover:text-white sm:inline"
                                >
                                    {t('nav.sign_in')}
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-500"
                                >
                                    {t('nav.register')}
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative z-10">
                <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                        <span
                            aria-hidden
                            className="h-1.5 w-1.5 rounded-full bg-cyan-400"
                        />
                        {t('landing.badge')}
                    </span>
                    <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                        {t('landing.hero.title_1')}{' '}
                        <span className="text-indigo-300">
                            {t('landing.hero.title_2')}
                        </span>{' '}
                        {t('landing.hero.title_3')}
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
                        {t('landing.hero.subtitle')}
                    </p>
                    <div className="mt-10 flex flex-wrap justify-center gap-3">
                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-indigo-500"
                            >
                                {t('landing.hero.signed_in_cta')}
                            </Link>
                        ) : (
                            <Link
                                href={route('register')}
                                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-indigo-500"
                            >
                                {t('landing.hero.cta_primary')}
                            </Link>
                        )}
                        <a
                            href="#how"
                            className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                        >
                            {t('landing.hero.cta_secondary')}
                        </a>
                    </div>

                    <dl className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-6 text-center">
                        {[
                            { n: '5', k: 'landing.stats.subtopics' },
                            { n: '50', k: 'landing.stats.questions' },
                            { n: '6', k: 'landing.stats.pages' },
                        ].map((s) => (
                            <div
                                key={s.k}
                                className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
                            >
                                <dt className="text-3xl font-semibold text-white sm:text-4xl">
                                    {s.n}
                                </dt>
                                <dd className="mt-1 text-xs uppercase tracking-wider text-slate-400">
                                    {t(s.k)}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="relative z-10">
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            {t('landing.features.title')}
                        </h2>
                        <p className="mt-3 text-slate-400">
                            {t('landing.features.subtitle')}
                        </p>
                    </div>

                    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((f) => (
                            <div
                                key={f.key}
                                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                                    {f.icon}
                                </div>
                                <h3 className="mt-4 text-base font-semibold text-white">
                                    {t(`landing.features.${f.key}.title`)}
                                </h3>
                                <p className="mt-1.5 text-sm text-slate-400">
                                    {t(`landing.features.${f.key}.desc`)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how" className="relative z-10">
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            {t('landing.how.title')}
                        </h2>
                        <p className="mt-3 text-slate-400">
                            {t('landing.how.subtitle')}
                        </p>
                    </div>
                    <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {steps.map((s, idx) => (
                            <li
                                key={s}
                                className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
                                    {idx + 1}
                                </div>
                                <h3 className="mt-4 text-base font-semibold text-white">
                                    {t(`landing.how.${s}.title`)}
                                </h3>
                                <p className="mt-1.5 text-sm text-slate-400">
                                    {t(`landing.how.${s}.desc`)}
                                </p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="relative z-10">
                <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
                    <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        {t('landing.faq.title')}
                    </h2>
                    <div className="mt-10 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
                        {faqs.map((q) => (
                            <details
                                key={q}
                                className="group p-6 [&_summary::-webkit-details-marker]:hidden"
                            >
                                <summary className="flex cursor-pointer items-center justify-between text-base font-medium text-white">
                                    {t(`landing.faq.${q}`)}
                                    <svg
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="h-5 w-5 text-slate-400 transition group-open:rotate-180"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </summary>
                                <p className="mt-3 text-sm text-slate-400">
                                    {t(
                                        `landing.faq.${q.replace('q', 'a')}`,
                                    )}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative z-10">
                <div className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-10 text-center sm:p-14">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            {t('landing.cta.title')}
                        </h2>
                        <p className="mx-auto mt-3 max-w-xl text-slate-300">
                            {t('landing.cta.subtitle')}
                        </p>
                        <div className="mt-8">
                            <Link
                                href={
                                    auth?.user
                                        ? route('dashboard')
                                        : route('register')
                                }
                                className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-indigo-500"
                            >
                                {t('landing.cta.button')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-slate-400 sm:flex-row sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <Logo className="h-6 w-6" />
                        <span>{t('app.name')}</span>
                    </div>
                    <div>{t('landing.footer.tagline')}</div>
                </div>
            </footer>
        </div>
    );
}
