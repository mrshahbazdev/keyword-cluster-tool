import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

function StatusPill({ project }) {
    const styles =
        project.status === 'completed'
            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
            : project.status === 'failed'
              ? 'bg-rose-50 text-rose-700 ring-rose-600/20'
              : 'bg-amber-50 text-amber-800 ring-amber-600/20';
    const dot =
        project.status === 'completed'
            ? 'bg-emerald-500'
            : project.status === 'failed'
              ? 'bg-rose-500'
              : 'bg-amber-500 animate-pulse';
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            {project.status_label}
        </span>
    );
}

export default function Index({ projects, gemini_configured }) {
    const handleDelete = (project) => {
        if (
            confirm(
                `Delete "${project.topic}"? This will remove all generated subtopics, questions, and pages.`,
            )
        ) {
            router.delete(route('projects.destroy', project.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-900">
                            Keyword Cluster Projects
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            One topic in → pillar page + 5 cluster pages out.
                        </p>
                    </div>
                    <Link
                        href={route('projects.create')}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-cyan-400"
                    >
                        <svg
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-4 w-4"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        New cluster
                    </Link>
                </div>
            }
        >
            <Head title="Projects" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {!gemini_configured && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            <p className="font-semibold">
                                Gemini API key not configured
                            </p>
                            <p className="mt-1">
                                Set{' '}
                                <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">
                                    GEMINI_API_KEY
                                </code>{' '}
                                in your{' '}
                                <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">
                                    .env
                                </code>{' '}
                                file (and restart the queue worker) to enable
                                content generation. Get a free key at{' '}
                                <a
                                    href="https://aistudio.google.com/app/apikey"
                                    className="font-medium underline"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    aistudio.google.com
                                </a>
                                .
                            </p>
                        </div>
                    )}

                    {projects.length === 0 ? (
                        <div className="relative overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-indigo-50 to-transparent" />
                            <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/30">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="h-7 w-7 text-white"
                                >
                                    <path
                                        d="M12 4v16m8-8H4"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>
                            <h3 className="relative mt-5 text-lg font-semibold text-gray-900">
                                No projects yet
                            </h3>
                            <p className="relative mx-auto mt-1 max-w-md text-sm text-gray-600">
                                Create your first keyword cluster to get a
                                pillar page and 5 cluster pages with 50 Q&amp;A
                                pairs.
                            </p>
                            <div className="relative mt-6">
                                <Link
                                    href={route('projects.create')}
                                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-cyan-400"
                                >
                                    Create your first cluster
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {projects.map((p) => (
                                <div
                                    key={p.id}
                                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                                >
                                    <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-cyan-400" />
                                    <div className="flex flex-1 flex-col p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <Link
                                                href={route(
                                                    'projects.show',
                                                    p.id,
                                                )}
                                                className="line-clamp-2 text-base font-semibold text-gray-900 hover:text-indigo-600"
                                            >
                                                {p.topic}
                                            </Link>
                                            <StatusPill project={p} />
                                        </div>
                                        <p className="mt-2 truncate text-sm text-gray-500">
                                            {p.website}
                                        </p>
                                        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                                            <span>{p.created_at}</span>
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={route(
                                                        'projects.show',
                                                        p.id,
                                                    )}
                                                    className="font-medium text-indigo-600 hover:text-indigo-500"
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(p)
                                                    }
                                                    className="font-medium text-rose-600 hover:text-rose-500"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
