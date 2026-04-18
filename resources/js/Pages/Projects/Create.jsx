import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

const pipeline = [
    { num: '1', label: '5 subtopics' },
    { num: '2', label: '10 Qs each' },
    { num: '3', label: 'AI answers' },
    { num: '4', label: '5 cluster pages' },
    { num: '5', label: '1 pillar page' },
];

export default function Create({ gemini_configured }) {
    const { data, setData, post, processing, errors } = useForm({
        topic: '',
        website: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('projects.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-semibold leading-tight text-gray-900">
                        New Keyword Cluster
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Tell us your topic and website — we&apos;ll handle the
                        rest.
                    </p>
                </div>
            }
        >
            <Head title="New Cluster" />

            <div className="py-8">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-cyan-400" />
                        <div className="p-6 sm:p-8">
                            {/* Pipeline preview */}
                            <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-gray-500">
                                {pipeline.map((s, i) => (
                                    <div
                                        key={s.num}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-[10px] font-bold text-white">
                                                {s.num}
                                            </span>
                                            <span>{s.label}</span>
                                        </div>
                                        {i < pipeline.length - 1 && (
                                            <svg
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className="h-3 w-3 text-gray-300"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M7.21 5.23a.75.75 0 011.06.02L12.5 9.48a.75.75 0 010 1.04l-4.23 4.23a.75.75 0 01-1.08-1.04l3.7-3.71-3.7-3.71a.75.75 0 01.02-1.06z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {!gemini_configured && (
                                <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                    <p className="font-semibold">
                                        Gemini API key not configured
                                    </p>
                                    <p className="mt-1">
                                        The project will be saved but generation
                                        will fail until{' '}
                                        <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">
                                            GEMINI_API_KEY
                                        </code>{' '}
                                        is set in{' '}
                                        <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">
                                            .env
                                        </code>
                                        .
                                    </p>
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <InputLabel
                                        htmlFor="topic"
                                        value="Topic / primary keyword"
                                    />
                                    <TextInput
                                        id="topic"
                                        type="text"
                                        name="topic"
                                        value={data.topic}
                                        placeholder="e.g. content marketing for SaaS"
                                        className="mt-1 block w-full"
                                        isFocused
                                        onChange={(e) =>
                                            setData('topic', e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.topic}
                                        className="mt-2"
                                    />
                                    <p className="mt-1.5 text-xs text-gray-500">
                                        The pillar topic we&apos;ll build 5
                                        subtopics around.
                                    </p>
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="website"
                                        value="Website"
                                    />
                                    <TextInput
                                        id="website"
                                        type="text"
                                        name="website"
                                        value={data.website}
                                        placeholder="e.g. acme-marketing.com or 'a SaaS for small e-commerce stores'"
                                        className="mt-1 block w-full"
                                        onChange={(e) =>
                                            setData('website', e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.website}
                                        className="mt-2"
                                    />
                                    <p className="mt-1.5 text-xs text-gray-500">
                                        A URL or short description — helps the
                                        AI tailor tone and audience.
                                    </p>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <Link
                                        href={route('projects.index')}
                                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-60"
                                    >
                                        {processing ? (
                                            <>
                                                <svg
                                                    className="h-4 w-4 animate-spin"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                >
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                        opacity="0.25"
                                                    />
                                                    <path
                                                        d="M4 12a8 8 0 018-8"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                Creating…
                                            </>
                                        ) : (
                                            <>
                                                Generate cluster
                                                <svg
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    className="h-4 w-4"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
