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
     * Instruction block appended to every prompt so Gemini produces all
     * generated content (titles, descriptions, questions, answers, markdown
     * pages) in the project's configured language.
     */
    protected function languageInstruction(Project $project): string
    {
        $name = $project->languageName();

        return "LANGUAGE: Write ALL output in {$name}. Every title, keyword, description, question, answer, heading, and paragraph must be in {$name} — including any text that follows an English field name like \"title\" or \"description\". Do not mix languages. Do not translate structural JSON keys or the literal marker text (e.g. [ANSWER N]) — only the human-readable content must be in {$name}.";
    }

    /**
     * Step 1: ask Gemini for 5 subtopics + descriptions + long-tail keywords.
     */
    public function generateSubtopics(Project $project): void
    {
        $lang = $this->languageInstruction($project);
        $prompt = <<<PROMPT
You are an expert SEO strategist helping plan a topic cluster for the website "{$project->website}".

The pillar topic is: "{$project->topic}"

{$lang}

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

        // Match the DataForSEO location + language to the project's language so
        // search volumes are relevant to the target audience (German keywords
        // should be scored in Germany, English in the US).
        [$locationCode, $languageCode] = match ($project->language) {
            'de' => [2276, 'de'],
            default => [2840, 'en'],
        };
        $metrics = $this->dataForSeo->searchVolume($keywords, $locationCode, $languageCode);

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
        $lang = $this->languageInstruction($project);

        $prompt = <<<PROMPT
You are an SEO content strategist for the website "{$project->website}".

Pillar topic: "{$project->topic}"
Sub-topic: "{$subtopic->title}"
Long-tail keyword: "{$subtopic->long_tail_keyword}"
Sub-topic description: {$subtopic->description}

{$lang}

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

        $list = $questions->map(fn ($q, $i) => '['.($i + 1).'] '.$q->question)->implode("\n");

        $lang = $this->languageInstruction($project);

        // Plain-text numbered output — avoids JSON escaping overhead that was
        // blowing the token budget and truncating answers mid-string.
        $prompt = <<<PROMPT
You are a subject-matter expert writing helpful, accurate answers for the website "{$project->website}".

Pillar topic: "{$project->topic}"
Sub-topic: "{$subtopic->title}"

{$lang}

Below are {$questions->count()} questions. Write a clear, useful answer to each one.
Each answer must be 2-4 sentences (50-120 words). Be direct and informative. Do not repeat the question in the answer.

Questions:
{$list}

OUTPUT FORMAT (strict):
For each answer, output a marker on its own line: [ANSWER N] where N is the question number.
Then output the answer text on the following lines. Separate answers with a blank line.

Example (for 2 questions):
[ANSWER 1]
First answer text goes here. It can span multiple sentences.

[ANSWER 2]
Second answer text goes here.

Produce answers for all {$questions->count()} questions. Output ONLY the markers and answers — no preamble, no closing remarks, no JSON, no code fences.
PROMPT;

        $text = $this->gemini->generateText($prompt, temperature: 0.6);

        $answers = $this->parseNumberedAnswers($text, $questions->count());

        if (empty($answers)) {
            throw new RuntimeException('Gemini returned no parseable answers for subtopic '.$subtopic->id);
        }

        DB::transaction(function () use ($questions, $answers) {
            foreach ($questions as $i => $question) {
                $answer = $answers[$i + 1] ?? null;
                $question->update(['answer' => $answer !== null && $answer !== '' ? $answer : null]);
            }
        });
    }

    /**
     * Parse the `[ANSWER N]` delimited plain-text response into an
     * associative array keyed by question number (1-based).
     *
     * @return array<int, string>
     */
    protected function parseNumberedAnswers(string $text, int $expected): array
    {
        $answers = [];
        // Split on the [ANSWER N] marker, keeping the number as a capture group.
        if (! preg_match_all('/\[ANSWER\s+(\d+)\]\s*(.*?)(?=\[ANSWER\s+\d+\]|\z)/is', $text, $matches, PREG_SET_ORDER)) {
            return [];
        }

        foreach ($matches as $m) {
            $num = (int) $m[1];
            $body = trim($m[2]);
            if ($num >= 1 && $num <= $expected && $body !== '') {
                $answers[$num] = $body;
            }
        }

        return $answers;
    }

    /**
     * Step 4: generate the cluster page (intro + Q&A) for a subtopic.
     */
    public function generateClusterPage(Subtopic $subtopic): void
    {
        $project = $subtopic->project;
        $questions = $subtopic->questions()->orderBy('sort_order')->get();

        $qaList = $questions->map(fn ($q, $i) => ($i + 1).'. '.$q->question)->implode("\n");
        $lang = $this->languageInstruction($project);

        $prompt = <<<PROMPT
You are an SEO content writer creating a cluster page for "{$project->website}".

Pillar topic: "{$project->topic}"
Sub-topic (cluster focus): "{$subtopic->title}"
Long-tail keyword to target: "{$subtopic->long_tail_keyword}"

{$lang}

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
        $faqHeading = $project->language === 'de'
            ? 'Häufig gestellte Fragen'
            : 'Frequently Asked Questions';
        $body = "# {$title}\n\n{$intro}\n\n## {$faqHeading}\n\n";
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
     *
     * Done in TWO calls to avoid JSON-escaping a large markdown body (which
     * reliably blows the output-token budget and truncates mid-string):
     *   5a. JSON call for metadata only (title + meta_description) — tiny, safe.
     *   5b. Plain-text call for the full markdown body — no JSON escaping, the
     *       entire token budget is spent on actual content.
     */
    public function generatePillarPage(Project $project): void
    {
        $subtopics = $project->subtopics()->orderBy('sort_order')->get();

        $subList = $subtopics->map(function ($s, $i) {
            return ($i + 1).'. '.$s->title.' — '.($s->long_tail_keyword ?? '')."\n   ".($s->description ?? '');
        })->implode("\n");
        $lang = $this->languageInstruction($project);

        // --- 5a. Metadata (small JSON, always safe) ---
        $metaPrompt = <<<PROMPT
You are an SEO strategist writing metadata for a PILLAR page on "{$project->website}".

Pillar topic / primary keyword: "{$project->topic}"

The pillar page will cover these 5 sub-topics:
{$subList}

{$lang}

Output JSON ONLY in this exact shape (no prose, no markdown fences):

{
  "title": "H1-style page title, max 70 characters, includes the primary keyword",
  "meta_description": "Compelling meta description (150-160 characters) including the primary keyword"
}
PROMPT;

        $meta = $this->gemini->generateJson($metaPrompt, temperature: 0.5);
        $title = (string) ($meta['title'] ?? $project->topic);
        $metaDesc = (string) ($meta['meta_description'] ?? '');

        // --- 5b. Body (plain markdown, no JSON escaping) ---
        $bodyPrompt = <<<PROMPT
You are an SEO content writer creating a comprehensive PILLAR page for "{$project->website}".

Pillar topic / primary keyword: "{$project->topic}"

The page title is: "{$title}"

{$lang}

The pillar page is the hub of a topic cluster. It links out to 5 cluster pages, each covering a sub-topic in depth:

{$subList}

Write the full pillar page in Markdown (~700-1100 words). Requirements:
- Start with an H1 exactly equal to the title above.
- Then an intro paragraph that comprehensively introduces the pillar topic and naturally includes the primary keyword.
- Then an H2 section for EACH of the 5 sub-topics. Use the sub-topic title as the H2. Each H2 section should be 2-3 short paragraphs and end with a sentence inviting the reader to read the dedicated cluster page on that sub-topic.
- End with a short conclusion paragraph.
- Be authoritative, specific, and useful on its own.

Return ONLY the raw Markdown — no JSON, no code fences, no commentary before or after.
PROMPT;

        $body = trim($this->gemini->generateText($bodyPrompt, temperature: 0.7));
        // Strip any stray ```markdown fences some models add anyway.
        $body = preg_replace('/^```(?:markdown|md)?\s*\n?|\n?```\s*$/i', '', $body) ?? $body;

        $project->update([
            'pillar_title' => $title,
            'pillar_meta_description' => mb_substr($metaDesc, 0, 320),
            'pillar_content' => $body,
        ]);
    }
}
