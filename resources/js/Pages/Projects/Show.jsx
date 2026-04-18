import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import useTranslations from '@/hooks/useTranslations';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

function StatusBanner({ status, t }) {
    if (status.status === 'completed') {
        return (
            <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                {t('projects.show.banner.completed')}
            </div>
        );
    }
    if (status.status === 'failed') {
        return (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <p className="font-semibold">
                    {t('projects.show.banner.failed')}
                </p>
                {status.error && (
                    <pre className="mt-2 whitespace-pre-wrap text-xs">
                        {status.error}
                    </pre>
                )}
            </div>
        );
    }
    const label =
        t(`projects.status.${status.status}`) || status.status_label;
    return (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <div className="flex items-center justify-between">
                <span>{label}…</span>
                <span className="text-xs">{status.progress_percent}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-amber-100">
                <div
                    className="h-full rounded-full bg-amber-500 transition-all"
                    style={{ width: `${status.progress_percent}%` }}
                />
            </div>
        </div>
    );
}

function MarkdownPreview({ text }) {
    if (!text) return null;
    // Lightweight markdown rendering — headings, paragraphs, bold/italic.
    const html = useMemo(() => renderMarkdown(text), [text]);
    return (
        <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

function renderMarkdown(md) {
    if (!md) return '';
    const escape = (s) =>
        s
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    const lines = md.split('\n');
    const out = [];
    let inList = false;
    const flushList = () => {
        if (inList) {
            out.push('</ul>');
            inList = false;
        }
    };
    for (let raw of lines) {
        const line = raw.trimEnd();
        if (/^### /.test(line)) {
            flushList();
            out.push(
                `<h3 class="mt-6 text-lg font-semibold">${inline(escape(line.replace(/^### /, '')))}</h3>`,
            );
        } else if (/^## /.test(line)) {
            flushList();
            out.push(
                `<h2 class="mt-8 text-xl font-bold">${inline(escape(line.replace(/^## /, '')))}</h2>`,
            );
        } else if (/^# /.test(line)) {
            flushList();
            out.push(
                `<h1 class="mt-4 text-2xl font-bold">${inline(escape(line.replace(/^# /, '')))}</h1>`,
            );
        } else if (/^[-*] /.test(line)) {
            if (!inList) {
                out.push('<ul class="list-disc pl-6 my-2">');
                inList = true;
            }
            out.push(
                `<li>${inline(escape(line.replace(/^[-*] /, '')))}</li>`,
            );
        } else if (line.trim() === '') {
            flushList();
            out.push('');
        } else {
            flushList();
            out.push(`<p class="my-3 leading-relaxed">${inline(escape(line))}</p>`);
        }
    }
    flushList();
    return out.join('\n');
}

function inline(text) {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code class="rounded bg-gray-100 px-1">$1</code>');
}

export default function Show({ project: initialProject }) {
    const { t } = useTranslations();
    const [project, setProject] = useState(initialProject);
    const [activeTab, setActiveTab] = useState('pillar');

    const isInProgress = project.is_in_progress;

    // Poll status while in progress.
    useEffect(() => {
        if (!isInProgress) return;
        const interval = setInterval(async () => {
            try {
                const resp = await fetch(
                    route('projects.status', project.id),
                    { headers: { Accept: 'application/json' } },
                );
                if (!resp.ok) return;
                const json = await resp.json();
                if (
                    json.status !== project.status ||
                    json.progress_percent !== project.progress_percent
                ) {
                    // Reload Inertia props to get the latest content.
                    router.reload({ only: ['project'] });
                }
            } catch (e) {
                // ignore
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [isInProgress, project.id, project.status, project.progress_percent]);

    // Sync prop -> state when Inertia reloads the page.
    useEffect(() => {
        setProject(initialProject);
    }, [initialProject]);

    const subtopics = project.subtopics ?? [];
    const activeSubtopic =
        activeTab.startsWith('cluster-')
            ? subtopics.find((s) => `cluster-${s.id}` === activeTab)
            : null;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            {project.topic}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {project.website}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {project.status === 'failed' && (
                            <RetryButton projectId={project.id} t={t} />
                        )}
                        <Link
                            href={route('projects.index')}
                            className="text-sm text-gray-600 hover:underline"
                        >
                            ← {t('projects.show.all_projects')}
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={project.topic} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <StatusBanner status={project} t={t} />

                    {/* Subtopic + Q&A overview */}
                    {subtopics.length > 0 && (
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700">
                                    {t('projects.show.subtopics_heading')}
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {subtopics.map((s, i) => (
                                    <details
                                        key={s.id}
                                        className="group px-6 py-4"
                                        open={i === 0}
                                    >
                                        <summary className="flex cursor-pointer items-center justify-between text-base font-medium text-gray-900">
                                            <span>
                                                {i + 1}. {s.title}
                                                {s.long_tail_keyword && (
                                                    <span className="ml-3 rounded bg-indigo-50 px-2 py-0.5 text-xs font-mono font-normal text-indigo-700">
                                                        {s.long_tail_keyword}
                                                    </span>
                                                )}
                                            </span>
                                            <span className="text-xs text-gray-500 group-open:hidden">
                                                {t(
                                                    'projects.show.questions_count',
                                                    {
                                                        count:
                                                            s.questions
                                                                ?.length ?? 0,
                                                    },
                                                )}
                                            </span>
                                        </summary>
                                        {s.description && (
                                            <p className="mt-2 text-sm text-gray-600">
                                                {s.description}
                                            </p>
                                        )}
                                        <SeoMetrics subtopic={s} t={t} />
                                        {s.questions &&
                                            s.questions.length > 0 && (
                                                <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm text-gray-800">
                                                    {s.questions.map((q) => (
                                                        <li key={q.id}>
                                                            <p className="font-medium">
                                                                {q.question}
                                                            </p>
                                                            {q.answer && (
                                                                <p className="mt-1 text-gray-600">
                                                                    {q.answer}
                                                                </p>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ol>
                                            )}
                                    </details>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pillar + cluster pages */}
                    {project.pillar_content && (
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('pillar')}
                                    className={`rounded px-3 py-1.5 text-sm font-medium ${
                                        activeTab === 'pillar'
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {t('projects.show.tab_pillar')}
                                </button>
                                {subtopics.map((s, i) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() =>
                                            setActiveTab(`cluster-${s.id}`)
                                        }
                                        className={`rounded px-3 py-1.5 text-sm font-medium ${
                                            activeTab === `cluster-${s.id}`
                                                ? 'bg-indigo-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-200'
                                        }`}
                                        disabled={!s.cluster_content}
                                        title={
                                            s.cluster_content
                                                ? ''
                                                : t(
                                                      'projects.show.cluster_not_ready',
                                                  )
                                        }
                                    >
                                        {t('projects.show.tab_cluster', {
                                            num: i + 1,
                                        })}
                                    </button>
                                ))}
                            </div>
                            <div className="px-6 py-6">
                                {activeTab === 'pillar' ? (
                                    <PageView
                                        t={t}
                                        title={project.pillar_title}
                                        meta={project.pillar_meta_description}
                                        content={project.pillar_content}
                                        downloadUrl={route(
                                            'projects.export.pillar',
                                            project.id,
                                        )}
                                    />
                                ) : activeSubtopic ? (
                                    <PageView
                                        t={t}
                                        title={activeSubtopic.cluster_title}
                                        meta={
                                            activeSubtopic.cluster_meta_description
                                        }
                                        content={activeSubtopic.cluster_content}
                                        downloadUrl={route(
                                            'projects.export.cluster',
                                            [project.id, activeSubtopic.id],
                                        )}
                                    />
                                ) : null}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function PageView({ t, title, meta, content, downloadUrl }) {
    const [showRaw, setShowRaw] = useState(false);
    return (
        <div>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {title}
                    </h2>
                    {meta && (
                        <p className="mt-1 text-sm italic text-gray-500">
                            {meta}
                        </p>
                    )}
                </div>
                <div className="flex gap-2">
                    <SecondaryButton
                        type="button"
                        onClick={() => setShowRaw((v) => !v)}
                    >
                        {showRaw
                            ? t('projects.show.preview')
                            : t('projects.show.view_markdown')}
                    </SecondaryButton>
                    <a href={downloadUrl}>
                        <PrimaryButton type="button">
                            {t('projects.show.download')}
                        </PrimaryButton>
                    </a>
                </div>
            </div>
            {showRaw ? (
                <pre className="overflow-x-auto rounded-md bg-gray-900 p-4 text-xs text-gray-100">
                    {content}
                </pre>
            ) : (
                <MarkdownPreview text={content} />
            )}
        </div>
    );
}

function SeoMetrics({ subtopic, t }) {
    const hasAny =
        subtopic.search_volume != null ||
        subtopic.cpc != null ||
        subtopic.competition != null;
    if (!hasAny) {
        return null;
    }

    const fmt = (n) => new Intl.NumberFormat().format(n);
    const competitionColor = {
        LOW: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        MEDIUM: 'bg-amber-50 text-amber-700 ring-amber-200',
        HIGH: 'bg-rose-50 text-rose-700 ring-rose-200',
    }[(subtopic.competition || '').toUpperCase()] ||
        'bg-slate-50 text-slate-700 ring-slate-200';

    return (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {subtopic.search_volume != null && (
                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-indigo-700 ring-1 ring-indigo-200">
                    <span className="font-medium">
                        {t('projects.show.seo.volume')}:
                    </span>
                    <span>{fmt(subtopic.search_volume)}</span>
                </span>
            )}
            {subtopic.cpc != null && (
                <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-1 text-sky-700 ring-1 ring-sky-200">
                    <span className="font-medium">
                        {t('projects.show.seo.cpc')}:
                    </span>
                    <span>${subtopic.cpc.toFixed(2)}</span>
                </span>
            )}
            {subtopic.competition && (
                <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 ring-1 ${competitionColor}`}
                >
                    <span className="font-medium">
                        {t('projects.show.seo.competition')}:
                    </span>
                    <span>
                        {t(
                            `projects.show.seo.competition_${subtopic.competition.toLowerCase()}`,
                        ) || subtopic.competition}
                    </span>
                </span>
            )}
            {subtopic.low_bid != null && subtopic.high_bid != null && (
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-slate-700 ring-1 ring-slate-200">
                    <span className="font-medium">
                        {t('projects.show.seo.bid')}:
                    </span>
                    <span>
                        ${subtopic.low_bid.toFixed(2)} – $
                        {subtopic.high_bid.toFixed(2)}
                    </span>
                </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-slate-500 ring-1 ring-slate-200">
                {t('projects.show.seo.source')}
            </span>
        </div>
    );
}

function RetryButton({ projectId, t }) {
    const handleClick = () => {
        router.post(route('projects.retry', projectId));
    };
    return (
        <button
            type="button"
            onClick={handleClick}
            className="rounded-md bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-600"
        >
            {t('projects.show.retry')}
        </button>
    );
}
