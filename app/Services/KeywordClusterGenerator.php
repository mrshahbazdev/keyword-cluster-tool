<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Subtopic;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class KeywordClusterGenerator
{
    public function __construct(
        protected GeminiService $gemini,
        protected DataForSeoService $dataForSeo,
    ) {}

    /**
     * Step 1: ask Gemini for 5 subtopics + descriptions + long-tail keywords.
     */
    public function generateSubtopics(Project $project): void
    {
        $prompt = <<<PROMPT
You are an expert SEO strategist helping plan a topic cluster for the website "{$project->website}".

The pillar topic is: "{$project->topic}"

Identify exactly 5 distinct, complementary SUB-TOPICS that together form a comprehensive content cluster around this pillar topic. Each sub-topic should:
- Cover a different facet/angle of the pillar topic (no overlap)
- Be specific enough to support a dedicated cluster page
- Be relevant to the website "{$project->website}" and its likely audience
- Have a clear, search-friendly long-tail keyword

Respond with ONLY a JSON array of 5 objects in this exact shape (no prose, no markdown fences):

[
  {
    "title": "Concise sub-topic title (max 8 words)",
    "long_tail_keyword": "the long-tail keyword users would search for (3-7 words)",
    "description": "1-2 sentence description of what this sub-topic covers and why it matters."
  }
]
PROMPT;

        $data = $this->gemini->generateJson($prompt, temperature: 0.7);

        if (! is_array($data) || count($data) < 1) {
            throw new RuntimeException('Gemini returned no subtopics.');
        }

        // Take first 5; pad isn't needed — model is instructed for exactly 5.
        $subtopics = array_slice(array_values($data), 0, 5);

        // Enrich with DataForSEO search volume / CPC / competition if configured.
        $keywords = array_values(array_filter(array_map(
            fn ($row) => is_array($row) && ! empty($row['long_tail_keyword'])
                ? (string) $row['long_tail_keyword']
                : null,
            $subtopics,
        )));
        $metrics = $this->dataForSeo->searchVolume($keywords);

        DB::transaction(function () use ($project, $subtopics, $metrics) {
            $project->subtopics()->delete();
            foreach ($subtopics as $i => $row) {
                if (! is_array($row)) {
                    continue;
                }
                $keyword = isset($row['long_tail_keyword']) ? (string) $row['long_tail_keyword'] : null;
                $m = $keyword ? ($metrics[strtolower(trim($keyword))] ?? null) : null;
                $project->subtopics()->create([
                    'title' => (string) ($row['title'] ?? ('Sub-topic '.($i + 1))),
                    'long_tail_keyword' => $keyword,
                    'description' => isset($row['description']) ? (string) $row['description'] : null,
                    'search_volume' => $m['search_volume'] ?? null,
                    'cpc' => $m['cpc'] ?? null,
                    'competition' => $m['competition'] ?? null,
                    'competition_index' => $m['competition_index'] ?? null,
                    'low_bid' => $m['low_bid'] ?? null,
                    'high_bid' => $m['high_bid'] ?? null,
                    'sort_order' => $i,
                ]);
            }
        });
    }

    /**
     * Step 2: for each subtopic, generate 10 user-intent questions.
     */
    public function generateQuestionsForSubtopic(Subtopic $subtopic): void
    {
        $project = $subtopic->project;

        $prompt = <<<PROMPT
You are an SEO content strategist for the website "{$project->website}".

Pillar topic: "{$project->topic}"
Sub-topic: "{$subtopic->title}"
Long-tail keyword: "{$subtopic->long_tail_keyword}"
Sub-topic description: {$subtopic->description}

Generate exactly 10 distinct questions that real users of "{$project->website}" would search for or ask about this sub-topic. The questions should:
- Cover a mix of intents (informational, comparative, how-to, troubleshooting, decision-making)
- Be phrased the way an actual user would type them into a search engine
- Not overlap or duplicate each other
- Be specific to the sub-topic, not generic to the pillar topic

Respond with ONLY a JSON array of 10 strings (no prose, no markdown fences):

["question 1", "question 2", "...", "question 10"]
PROMPT;

        $data = $this->gemini->generateJson($prompt, temperature: 0.7);

        if (! is_array($data) || count($data) < 1) {
            throw new RuntimeException('Gemini returned no questions for subtopic '.$subtopic->id);
        }

        $questions = array_slice(array_values($data), 0, 10);

        DB::transaction(function () use ($subtopic, $questions) {
            $subtopic->questions()->delete();
            foreach ($questions as $i => $q) {
                $text = is_array($q) ? (string) ($q['question'] ?? json_encode($q)) : (string) $q;
                $subtopic->questions()->create([
                    'question' => $text,
                    'sort_order' => $i,
                ]);
            }
        });
    }

    /**
     * Step 3: answer all questions for a subtopic in one call (efficient).
     */
    public function generateAnswersForSubtopic(Subtopic $subtopic): void
    {
        $project = $subtopic->project;
        $questions = $subtopic->questions()->orderBy('sort_order')->get();

        if ($questions->isEmpty()) {
            return;
        }

        $list = $questions->map(fn ($q, $i) => ($i + 1).'. '.$q->question)->implode("\n");

        $prompt = <<<PROMPT
You are a subject-matter expert writing helpful, accurate answers for the website "{$project->website}".

Pillar topic: "{$project->topic}"
Sub-topic: "{$subtopic->title}"

Below are {$questions->count()} questions a user might ask. Write a clear, useful answer to each one.
Each answer must be 2-4 sentences (50-120 words). Be direct and informative. Do not include the question in the answer.

Questions:
{$list}

Respond with ONLY a JSON array of {$questions->count()} objects in this exact shape (no prose, no markdown fences):

[
  {"question": "the original question text", "answer": "the 2-4 sentence answer"}
]

The order MUST match the question order above.
PROMPT;

        $data = $this->gemini->generateJson($prompt, temperature: 0.6);

        if (! is_array($data) || count($data) < 1) {
            throw new RuntimeException('Gemini returned no answers for subtopic '.$subtopic->id);
        }

        DB::transaction(function () use ($questions, $data) {
            foreach ($questions as $i => $question) {
                $row = $data[$i] ?? null;
                if (! is_array($row)) {
                    continue;
                }
                $answer = (string) ($row['answer'] ?? '');
                $question->update(['answer' => $answer !== '' ? $answer : null]);
            }
        });
    }

    /**
     * Step 4: generate the cluster page (intro + Q&A) for a subtopic.
     */
    public function generateClusterPage(Subtopic $subtopic): void
    {
        $project = $subtopic->project;
        $questions = $subtopic->questions()->orderBy('sort_order')->get();

        $qaList = $questions->map(fn ($q, $i) => ($i + 1).'. '.$q->question)->implode("\n");

        $prompt = <<<PROMPT
You are an SEO content writer creating a cluster page for "{$project->website}".

Pillar topic: "{$project->topic}"
Sub-topic (cluster focus): "{$subtopic->title}"
Long-tail keyword to target: "{$subtopic->long_tail_keyword}"

Write the introductory portion of a cluster page that targets the long-tail keyword. The page should focus tightly on the sub-topic and naturally link back to the broader pillar topic.

Output JSON ONLY in this exact shape (no prose, no markdown fences):

{
  "title": "An H1-style page title (max 70 characters) that includes the long-tail keyword",
  "meta_description": "A compelling meta description (150-160 characters) that includes the long-tail keyword",
  "introduction_markdown": "A 200-350 word introduction in Markdown. Use 2-3 short paragraphs. Establish the sub-topic, why it matters to the reader, and what they'll learn. Do NOT include the questions/answers — those are added separately."
}

For context, the page will then list the following {$questions->count()} questions with answers:
{$qaList}
PROMPT;

        $data = $this->gemini->generateJson($prompt, temperature: 0.7);

        $title = (string) ($data['title'] ?? $subtopic->title);
        $meta = (string) ($data['meta_description'] ?? '');
        $intro = (string) ($data['introduction_markdown'] ?? '');

        // Assemble the full markdown page.
        $body = "# {$title}\n\n{$intro}\n\n## Frequently Asked Questions\n\n";
        foreach ($questions as $q) {
            $body .= "### {$q->question}\n\n".($q->answer ?? '_Answer not yet generated._')."\n\n";
        }

        $subtopic->update([
            'cluster_title' => $title,
            'cluster_meta_description' => mb_substr($meta, 0, 320),
            'cluster_content' => $body,
        ]);
    }

    /**
     * Step 5: generate the pillar page that ties all sub-topics together.
     */
    public function generatePillarPage(Project $project): void
    {
        $subtopics = $project->subtopics()->orderBy('sort_order')->get();

        $subList = $subtopics->map(function ($s, $i) {
            return ($i + 1).'. '.$s->title.' — '.($s->long_tail_keyword ?? '')."\n   ".($s->description ?? '');
        })->implode("\n");

        $prompt = <<<PROMPT
You are an SEO content writer creating a comprehensive PILLAR page for "{$project->website}".

Pillar topic / primary keyword: "{$project->topic}"

This pillar page is the hub of a topic cluster. It will link out to 5 cluster pages, each covering a sub-topic in depth:

{$subList}

Write the pillar page content. The pillar page should:
- Comprehensively introduce the pillar topic
- Briefly explain each of the 5 sub-topics (1 short paragraph each) and tease that a dedicated cluster page covers them in depth
- Be authoritative and useful on its own
- Naturally include the primary keyword

Output JSON ONLY in this exact shape (no prose, no markdown fences):

{
  "title": "An H1-style page title for the pillar page (max 70 characters), include the primary keyword",
  "meta_description": "A compelling meta description (150-160 characters) including the primary keyword",
  "content_markdown": "The full pillar page in Markdown (~700-1100 words). Structure: H1 title, intro paragraph, then an H2 section for EACH of the 5 sub-topics (use the sub-topic title as the H2). Each H2 section should be 2-3 short paragraphs and end with a sentence inviting the reader to read the dedicated cluster page on that sub-topic. End with a short conclusion paragraph."
}
PROMPT;

        $data = $this->gemini->generateJson($prompt, temperature: 0.7);

        $project->update([
            'pillar_title' => (string) ($data['title'] ?? $project->topic),
            'pillar_meta_description' => mb_substr((string) ($data['meta_description'] ?? ''), 0, 320),
            'pillar_content' => (string) ($data['content_markdown'] ?? ''),
        ]);
    }
}
