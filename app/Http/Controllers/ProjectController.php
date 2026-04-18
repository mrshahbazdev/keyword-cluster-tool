<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Jobs\GenerateProjectJob;
use App\Models\Project;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $projects = $request->user()->projects()
            ->orderByDesc('id')
            ->get()
            ->map(fn (Project $p) => $this->summarize($p));

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'gemini_configured' => ! empty(config('services.gemini.api_key')),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Projects/Create', [
            'gemini_configured' => ! empty(config('services.gemini.api_key')),
        ]);
    }

    public function store(StoreProjectRequest $request): RedirectResponse
    {
        $project = $request->user()->projects()->create([
            'topic' => $request->string('topic'),
            'website' => $request->string('website'),
            'status' => Project::STATUS_PENDING,
        ]);

        GenerateProjectJob::dispatch($project->id);

        return redirect()->route('projects.show', $project);
    }

    public function show(Request $request, Project $project): Response
    {
        $this->authorizeProject($request, $project);

        $project->load(['subtopics.questions']);

        return Inertia::render('Projects/Show', [
            'project' => [
                'id' => $project->id,
                'topic' => $project->topic,
                'website' => $project->website,
                'status' => $project->status,
                'status_label' => $project->statusLabel(),
                'progress_percent' => $project->progressPercent(),
                'is_in_progress' => $project->isInProgress(),
                'error' => $project->error,
                'pillar_title' => $project->pillar_title,
                'pillar_meta_description' => $project->pillar_meta_description,
                'pillar_content' => $project->pillar_content,
                'created_at' => $project->created_at?->toDateTimeString(),
                'updated_at' => $project->updated_at?->toDateTimeString(),
                'subtopics' => $project->subtopics->map(fn ($s) => [
                    'id' => $s->id,
                    'title' => $s->title,
                    'long_tail_keyword' => $s->long_tail_keyword,
                    'description' => $s->description,
                    'cluster_title' => $s->cluster_title,
                    'cluster_meta_description' => $s->cluster_meta_description,
                    'cluster_content' => $s->cluster_content,
                    'questions' => $s->questions->map(fn ($q) => [
                        'id' => $q->id,
                        'question' => $q->question,
                        'answer' => $q->answer,
                    ]),
                ]),
            ],
            'gemini_configured' => ! empty(config('services.gemini.api_key')),
        ]);
    }

    public function status(Request $request, Project $project)
    {
        $this->authorizeProject($request, $project);

        return response()->json([
            'id' => $project->id,
            'status' => $project->status,
            'status_label' => $project->statusLabel(),
            'progress_percent' => $project->progressPercent(),
            'is_in_progress' => $project->isInProgress(),
            'error' => $project->error,
        ]);
    }

    public function retry(Request $request, Project $project): RedirectResponse
    {
        $this->authorizeProject($request, $project);

        $project->update([
            'status' => Project::STATUS_PENDING,
            'error' => null,
        ]);

        GenerateProjectJob::dispatch($project->id);

        return redirect()->route('projects.show', $project);
    }

    public function destroy(Request $request, Project $project): RedirectResponse
    {
        $this->authorizeProject($request, $project);
        $project->delete();

        return redirect()->route('projects.index');
    }

    public function exportPillar(Request $request, Project $project)
    {
        $this->authorizeProject($request, $project);

        $filename = sprintf('pillar-%s.md', Str::slug($project->topic ?: 'page'));
        $body = sprintf(
            "<!--\nTitle: %s\nMeta Description: %s\n-->\n\n%s\n",
            $project->pillar_title ?? '',
            $project->pillar_meta_description ?? '',
            $project->pillar_content ?? ''
        );

        return response($body, 200, [
            'Content-Type' => 'text/markdown; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

    public function exportCluster(Request $request, Project $project, int $subtopic)
    {
        $this->authorizeProject($request, $project);

        $sub = $project->subtopics()->findOrFail($subtopic);

        $filename = sprintf(
            'cluster-%s.md',
            Str::slug($sub->long_tail_keyword ?: $sub->title ?: 'page')
        );

        $body = sprintf(
            "<!--\nTitle: %s\nMeta Description: %s\nLong-tail keyword: %s\n-->\n\n%s\n",
            $sub->cluster_title ?? '',
            $sub->cluster_meta_description ?? '',
            $sub->long_tail_keyword ?? '',
            $sub->cluster_content ?? ''
        );

        return response($body, 200, [
            'Content-Type' => 'text/markdown; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

    protected function authorizeProject(Request $request, Project $project): void
    {
        if ($project->user_id !== $request->user()?->id) {
            throw new AuthorizationException;
        }
    }

    protected function summarize(Project $p): array
    {
        return [
            'id' => $p->id,
            'topic' => $p->topic,
            'website' => $p->website,
            'status' => $p->status,
            'status_label' => $p->statusLabel(),
            'progress_percent' => $p->progressPercent(),
            'is_in_progress' => $p->isInProgress(),
            'error' => $p->error,
            'created_at' => $p->created_at?->toDateTimeString(),
        ];
    }
}
