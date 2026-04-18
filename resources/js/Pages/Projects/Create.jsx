import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import useTranslations from '@/hooks/useTranslations';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ gemini_configured }) {
    const { t } = useTranslations();

    const pipeline = [
        { num: '1', label: t('projects.create.pipeline.1') },
        { num: '2', label: t('projects.create.pipeline.2') },
        { num: '3', label: t('projects.create.pipeline.3') },
        { num: '4', label: t('projects.create.pipeline.4') },
        { num: '5', label: t('projects.create.pipeline.5') },
    ];

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
                        {t('projects.create.title')}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        {t('projects.create.subtitle')}
                    </p>
                </div>
            }
        >
            <Head title={t('projects.create.title')} />

            <div className="py-8">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="h-1 w-full bg-indigo-500" />
                        <div className="p-6 sm:p-8">
                            {/* Pipeline preview */}
                            <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-gray-500">
                                {pipeline.map((s, i) => (
                                    <div
                                        key={s.num}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
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
                                        {t(
                                            'projects.gemini_not_configured.title',
                                        )}
                                    </p>
                                    <p className="mt-1">
                                        {t(
                                            'projects.gemini_not_configured.body',
                                        )}
                                    </p>
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <InputLabel
                                        htmlFor="topic"
                                        value={t(
                                            'projects.create.form.topic_label',
                                        )}
                                    />
                                    <TextInput
                                        id="topic"
                                        type="text"
                                        name="topic"
                                        value={data.topic}
                                        placeholder={t(
                                            'projects.create.form.topic_placeholder',
                                        )}
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
                                        {t(
                                            'projects.create.form.topic_help',
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="website"
                                        value={t(
                                            'projects.create.form.website_label',
                                        )}
                                    />
                                    <TextInput
                                        id="website"
                                        type="text"
                                        name="website"
                                        value={data.website}
                                        placeholder={t(
                                            'projects.create.form.website_placeholder',
                                        )}
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
                                        {t(
                                            'projects.create.form.website_help',
                                        )}
                                    </p>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <Link
                                        href={route('projects.index')}
                                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                                    >
                                        {t(
                                            'projects.create.form.cancel',
                                        )}
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-60"
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
                                                {t(
                                                    'projects.create.form.submitting',
                                                )}
                                            </>
                                        ) : (
                                            t(
                                                'projects.create.form.submit',
                                            )
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
