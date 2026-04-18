import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, router } from '@inertiajs/react';

function StatusPill({ project }) {
    const color =
        project.status === 'completed'
            ? 'bg-green-100 text-green-800'
            : project.status === 'failed'
              ? 'bg-red-100 text-red-800'
              : 'bg-amber-100 text-amber-800';
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}
        >
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
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Keyword Cluster Projects
                    </h2>
                    <Link href={route('projects.create')}>
                        <PrimaryButton>+ New cluster</PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Projects" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {!gemini_configured && (
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            <p className="font-semibold">
                                Gemini API key not configured
                            </p>
                            <p className="mt-1">
                                Set{' '}
                                <code className="rounded bg-amber-100 px-1 py-0.5">
                                    GEMINI_API_KEY
                                </code>{' '}
                                in your{' '}
                                <code className="rounded bg-amber-100 px-1 py-0.5">
                                    .env
                                </code>{' '}
                                file (and restart the queue worker) to enable
                                content generation. You can get a free key at{' '}
                                <a
                                    href="https://aistudio.google.com/app/apikey"
                                    className="underline"
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
                        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
                            <h3 className="text-lg font-semibold text-gray-900">
                                No projects yet
                            </h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Create your first keyword cluster to get a
                                pillar page and 5 cluster pages with Q&amp;A.
                            </p>
                            <div className="mt-4">
                                <Link href={route('projects.create')}>
                                    <PrimaryButton>
                                        + Create your first cluster
                                    </PrimaryButton>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    <tr>
                                        <th className="px-6 py-3">Topic</th>
                                        <th className="px-6 py-3">Website</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Created</th>
                                        <th className="px-6 py-3 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white text-sm text-gray-900">
                                    {projects.map((p) => (
                                        <tr key={p.id}>
                                            <td className="px-6 py-4 font-medium">
                                                <Link
                                                    href={route(
                                                        'projects.show',
                                                        p.id,
                                                    )}
                                                    className="text-indigo-600 hover:underline"
                                                >
                                                    {p.topic}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {p.website}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusPill project={p} />
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {p.created_at}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={route(
                                                        'projects.show',
                                                        p.id,
                                                    )}
                                                    className="text-indigo-600 hover:underline"
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(p)
                                                    }
                                                    className="ml-4 text-red-600 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
