<?php

namespace App\Jobs;

use App\Models\Project;
use App\Services\KeywordClusterGenerator;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Orchestrates the full generation pipeline for a project. Runs each step
 * sequentially in a single queued job so we can update status as we go.
 */
class GenerateProjectJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 1200; // 20 minutes total for the whole pipeline.

    public int $tries = 1;

    public function __construct(public int $projectId) {}

    public function handle(KeywordClusterGenerator $generator): void
    {
        $project = Project::find($this->projectId);
        if (! $project) {
            return;
        }

        try {
            // Step 1: subtopics
            $project->update(['status' => Project::STATUS_GENERATING_SUBTOPICS, 'error' => null]);
            $generator->generateSubtopics($project);

            // Step 2: questions for each subtopic
            $project->update(['status' => Project::STATUS_GENERATING_QUESTIONS]);
            foreach ($project->subtopics()->get() as $subtopic) {
                $generator->generateQuestionsForSubtopic($subtopic);
            }

            // Step 3: answers for each subtopic
            $project->update(['status' => Project::STATUS_GENERATING_ANSWERS]);
            foreach ($project->subtopics()->get() as $subtopic) {
                $generator->generateAnswersForSubtopic($subtopic);
            }

            // Step 4 & 5: cluster pages + pillar page
            $project->update(['status' => Project::STATUS_GENERATING_PAGES]);
            foreach ($project->subtopics()->get() as $subtopic) {
                $generator->generateClusterPage($subtopic);
            }
            $generator->generatePillarPage($project->fresh());

            $project->update(['status' => Project::STATUS_COMPLETED]);
        } catch (Throwable $e) {
            Log::error('GenerateProjectJob failed', [
                'project_id' => $this->projectId,
                'message' => $e->getMessage(),
            ]);

            $project->update([
                'status' => Project::STATUS_FAILED,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function failed(Throwable $e): void
    {
        $project = Project::find($this->projectId);
        if ($project) {
            $project->update([
                'status' => Project::STATUS_FAILED,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
