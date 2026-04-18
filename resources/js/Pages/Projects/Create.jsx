import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

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
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    New Keyword Cluster
                </h2>
            }
        >
            <Head title="New Cluster" />

            <div className="py-8">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg bg-white p-6 shadow-sm">
                        <p className="mb-6 text-sm text-gray-600">
                            Enter your pillar topic and website. We'll generate
                            5 sub-topics, 10 user-intent questions per
                            sub-topic, AI-written answers, 5 cluster pages, and
                            1 pillar page.
                        </p>

                        {!gemini_configured && (
                            <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                Gemini API key not configured. The project will
                                be saved but generation will fail until{' '}
                                <code>GEMINI_API_KEY</code> is set in{' '}
                                <code>.env</code>.
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="topic" value="Topic" />
                                <TextInput
                                    id="topic"
                                    type="text"
                                    name="topic"
                                    value={data.topic}
                                    placeholder="e.g. content marketing"
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
                                <p className="mt-1 text-xs text-gray-500">
                                    The pillar topic / primary keyword.
                                </p>
                            </div>

                            <div>
                                <InputLabel htmlFor="website" value="Website" />
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
                                <p className="mt-1 text-xs text-gray-500">
                                    A URL or short description of the site —
                                    helps the AI tailor the audience.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-4">
                                <Link
                                    href={route('projects.index')}
                                    className="text-sm text-gray-600 hover:underline"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    {processing
                                        ? 'Creating...'
                                        : 'Generate cluster'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
