import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslations from '@/hooks/useTranslations';
import { Head, Link, router } from '@inertiajs/react';

function StatusPill({ project, t }) {
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
    const label = t(`projects.status.${project.status}`) || project.status_label;
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            {label}
        </span>
    );
}

export default function Index({ projects, gemini_configured }) {
    const { t } = useTranslations();

    const handleDelete = (project) => {
        if (confirm(t('projects.delete_confirm', { topic: project.topic }))) {
            router.delete(route('projects.destroy', project.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-900">
                            {t('projects.title')}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {t('projects.subtitle')}
                        </p>
                    </div>
                    <Link
                        href={route('projects.create')}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
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
                        {t('projects.new_cluster')}
                    </Link>
                </div>
            }
        >
            <Head title={t('projects.title')} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {!gemini_configured && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            <p className="font-semibold">
                                {t('projects.gemini_not_configured.title')}
                            </p>
                            <p className="mt-1">
                                {t('projects.gemini_not_configured.body')}
                            </p>
                        </div>
                    )}

                    {projects.length === 0 ? (
                        <div className="relative overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
                            <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-sm">
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
                                {t('projects.empty.title')}
                            </h3>
                            <p className="relative mx-auto mt-1 max-w-md text-sm text-gray-600">
                                {t('projects.empty.subtitle')}
                            </p>
                            <div className="relative mt-6">
                                <Link
                                    href={route('projects.create')}
                                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                                >
                                    {t('projects.empty.cta')}
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
                                    <div className="h-1 w-full bg-indigo-500" />
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
                                            <StatusPill project={p} t={t} />
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
                                                    {t('projects.action.view')}
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(p)
                                                    }
                                                    className="font-medium text-rose-600 hover:text-rose-500"
                                                >
                                                    {t(
                                                        'projects.action.delete',
                                                    )}
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
