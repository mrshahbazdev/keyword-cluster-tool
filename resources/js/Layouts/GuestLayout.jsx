import { Link } from '@inertiajs/react';

function Logo({ className = 'h-8 w-8' }) {
    return (
        <svg
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="guest-logo-g" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
            </defs>
            <circle cx="16" cy="16" r="4" fill="url(#guest-logo-g)" />
            <circle
                cx="5"
                cy="6"
                r="2.5"
                fill="url(#guest-logo-g)"
                opacity="0.9"
            />
            <circle
                cx="27"
                cy="6"
                r="2.5"
                fill="url(#guest-logo-g)"
                opacity="0.9"
            />
            <circle
                cx="27"
                cy="26"
                r="2.5"
                fill="url(#guest-logo-g)"
                opacity="0.9"
            />
            <circle
                cx="5"
                cy="26"
                r="2.5"
                fill="url(#guest-logo-g)"
                opacity="0.9"
            />
            <path
                d="M16 16 L5 6 M16 16 L27 6 M16 16 L27 26 M16 16 L5 26"
                stroke="url(#guest-logo-g)"
                strokeWidth="1.2"
                opacity="0.5"
                fill="none"
            />
        </svg>
    );
}

export default function GuestLayout({ children, title, subtitle }) {
    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
            {/* Left panel (hidden on small screens) */}
            <aside className="relative hidden w-1/2 overflow-hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-slate-900 to-cyan-600" />
                <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-500/40 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-400/30 blur-3xl" />
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
                        backgroundSize: '44px 44px',
                    }}
                />

                <div className="relative z-10 flex h-full flex-col p-12">
                    <Link href="/" className="flex items-center gap-2 text-white">
                        <Logo className="h-8 w-8" />
                        <span className="text-lg font-semibold">
                            ClusterForge
                        </span>
                    </Link>

                    <div className="mt-20 max-w-md">
                        <h1 className="text-4xl font-bold leading-tight text-white">
                            One topic in.
                            <br />
                            <span className="bg-gradient-to-r from-indigo-200 via-sky-200 to-cyan-200 bg-clip-text text-transparent">
                                Pillar + 5 clusters out.
                            </span>
                        </h1>
                        <p className="mt-6 text-lg text-indigo-100/90">
                            Generate 5 subtopics, 50 user-intent questions, AI
                            answers, and a ready-to-publish content cluster in
                            minutes — powered by Google Gemini.
                        </p>

                        <ul className="mt-10 space-y-4 text-sm text-indigo-50/90">
                            {[
                                '5 long-tail subtopics per keyword',
                                '10 user-intent questions per subtopic',
                                'AI-written answers for all 50 questions',
                                'Pillar page + 5 cluster pages, markdown ready',
                            ].map((t) => (
                                <li key={t} className="flex items-start gap-3">
                                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
                                        <svg
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            className="h-3 w-3 text-white"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </span>
                                    <span>{t}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-auto text-sm text-indigo-100/70">
                        Built with Laravel · React · Google Gemini
                    </div>
                </div>
            </aside>

            {/* Right panel — the form */}
            <main className="relative flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-12">
                {/* Subtle decorative bg for mobile */}
                <div className="pointer-events-none absolute inset-0 -z-10 lg:hidden">
                    <div className="absolute left-1/2 top-[-6rem] h-64 w-80 -translate-x-1/2 rounded-full bg-indigo-500/25 blur-[100px]" />
                    <div className="absolute right-[-4rem] bottom-[-4rem] h-64 w-64 rounded-full bg-cyan-400/20 blur-[100px]" />
                </div>

                <div className="w-full max-w-md">
                    <div className="mb-8 flex items-center gap-2 lg:hidden">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-white"
                        >
                            <Logo className="h-7 w-7" />
                            <span className="text-base font-semibold">
                                ClusterForge
                            </span>
                        </Link>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white p-8 text-slate-800 shadow-2xl shadow-black/20 sm:p-10">
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
