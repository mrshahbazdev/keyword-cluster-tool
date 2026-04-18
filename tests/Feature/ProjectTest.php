<?php

namespace Tests\Feature;

use App\Jobs\GenerateProjectJob;
use App\Models\Project;
use App\Models\User;
use App\Services\DataForSeoService;
use App\Services\GeminiService;
use App\Services\KeywordClusterGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_requires_auth(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_authenticated_user_can_view_empty_dashboard(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Projects/Index'));
    }

    public function test_user_can_create_project_and_dispatch_job(): void
    {
        Bus::fake();

        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/projects', [
            'topic' => 'content marketing',
            'website' => 'acme.com',
        ]);

        $project = Project::firstOrFail();
        $response->assertRedirect(route('projects.show', $project));

        $this->assertSame($user->id, $project->user_id);
        $this->assertSame('content marketing', $project->topic);
        $this->assertSame(Project::STATUS_PENDING, $project->status);
        Bus::assertDispatched(GenerateProjectJob::class, fn ($j) => $j->projectId === $project->id);
    }

    public function test_user_cannot_view_other_users_project(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $project = Project::create([
            'user_id' => $owner->id,
            'topic' => 'x',
            'website' => 'y',
        ]);

        $this->actingAs($other)
            ->get(route('projects.show', $project))
            ->assertForbidden();
    }

    public function test_status_endpoint_returns_progress(): void
    {
        $user = User::factory()->create();
        $project = Project::create([
            'user_id' => $user->id,
            'topic' => 'x',
            'website' => 'y',
            'status' => Project::STATUS_GENERATING_QUESTIONS,
        ]);

        $this->actingAs($user)
            ->getJson(route('projects.status', $project))
            ->assertOk()
            ->assertJson([
                'id' => $project->id,
                'status' => 'generating_questions',
                'is_in_progress' => true,
            ]);
    }

    public function test_generator_persists_subtopics_questions_answers_and_pages(): void
    {
        $user = User::factory()->create();
        $project = Project::create([
            'user_id' => $user->id,
            'topic' => 'content marketing',
            'website' => 'acme.com',
        ]);

        $fake = $this->makeFakeGemini();
        $generator = new KeywordClusterGenerator($fake, new DataForSeoService);

        $generator->generateSubtopics($project);
        $this->assertCount(5, $project->subtopics()->get());

        foreach ($project->subtopics as $sub) {
            $generator->generateQuestionsForSubtopic($sub);
            $this->assertCount(10, $sub->questions()->get());
            $generator->generateAnswersForSubtopic($sub);
            $this->assertSame(
                10,
                $sub->questions()->whereNotNull('answer')->count(),
            );
            $generator->generateClusterPage($sub->fresh());
        }

        $generator->generatePillarPage($project->fresh());

        $project->refresh();
        $this->assertNotEmpty($project->pillar_title);
        $this->assertNotEmpty($project->pillar_content);
        foreach ($project->subtopics as $sub) {
            $this->assertNotEmpty($sub->cluster_title);
            $this->assertNotEmpty($sub->cluster_content);
        }
    }

    /**
     * Build a fake GeminiService that returns deterministic structured data
     * so we never hit the real API in tests.
     */
    protected function makeFakeGemini(): GeminiService
    {
        return new class extends GeminiService
        {
            public function __construct() {}

            public function generateText(string $prompt, float $temperature = 0.7): string
            {
                return 'fake text';
            }

            public function generateJson(string $prompt, float $temperature = 0.6): array
            {
                if (stripos($prompt, 'sub-topics that together form') !== false) {
                    return array_map(fn ($i) => [
                        'title' => "Subtopic $i",
                        'long_tail_keyword' => "keyword $i",
                        'description' => "Description $i",
                    ], range(1, 5));
                }
                if (str_contains($prompt, 'questions that real users')) {
                    return array_map(fn ($i) => "Question $i?", range(1, 10));
                }
                if (str_contains($prompt, 'Write a clear, useful answer')) {
                    return array_map(fn ($i) => [
                        'question' => "Question $i?",
                        'answer' => "Answer $i.",
                    ], range(1, 10));
                }
                if (str_contains($prompt, 'cluster page that targets the long-tail keyword')) {
                    return [
                        'title' => 'Cluster Page Title',
                        'meta_description' => 'meta',
                        'introduction_markdown' => 'intro',
                    ];
                }
                if (str_contains($prompt, 'PILLAR page')) {
                    return [
                        'title' => 'Pillar Page Title',
                        'meta_description' => 'pillar meta',
                        'content_markdown' => "# Pillar\n\nbody",
                    ];
                }

                return [];
            }
        };
    }
}
