<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class GeminiService
{
    public function __construct(
        protected ?string $apiKey = null,
        protected ?string $model = null,
        protected ?string $baseUrl = null,
        protected ?int $timeout = null,
    ) {
        $this->apiKey ??= (string) config('services.gemini.api_key');
        $this->model ??= (string) config('services.gemini.model', 'gemini-2.0-flash');
        $this->baseUrl ??= rtrim((string) config('services.gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta'), '/');
        $this->timeout ??= (int) config('services.gemini.timeout', 120);
    }

    /**
     * Generate plain text from a prompt.
     */
    public function generateText(string $prompt, float $temperature = 0.7): string
    {
        $response = $this->callApi($prompt, $temperature, jsonMode: false);

        return $this->extractText($response);
    }

    /**
     * Generate a JSON-decoded structured response from a prompt.
     * The prompt MUST instruct the model to return JSON.
     *
     * @return array<string, mixed>|array<int, mixed>
     */
    public function generateJson(string $prompt, float $temperature = 0.6): array
    {
        $response = $this->callApi($prompt, $temperature, jsonMode: true);
        $text = $this->extractText($response);

        $decoded = $this->decodeJson($text);

        if (! is_array($decoded)) {
            throw new RuntimeException('Gemini returned non-array JSON: '.substr($text, 0, 500));
        }

        return $decoded;
    }

    /**
     * Low-level API call.
     *
     * @return array<string, mixed>
     */
    protected function callApi(string $prompt, float $temperature, bool $jsonMode): array
    {
        if (empty($this->apiKey)) {
            throw new RuntimeException(
                'GEMINI_API_KEY is not configured. Set it in your .env file to enable AI generation.'
            );
        }

        $url = sprintf('%s/models/%s:generateContent', $this->baseUrl, $this->model);

        $payload = [
            'contents' => [[
                'role' => 'user',
                'parts' => [['text' => $prompt]],
            ]],
            'generationConfig' => [
                'temperature' => $temperature,
                'maxOutputTokens' => 8192,
            ],
        ];

        if ($jsonMode) {
            $payload['generationConfig']['responseMimeType'] = 'application/json';
        }

        $response = Http::timeout($this->timeout)
            ->withHeaders([
                'x-goog-api-key' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])
            ->post($url, $payload);

        if ($response->failed()) {
            Log::warning('Gemini API call failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            throw new RuntimeException(
                sprintf('Gemini API error %d: %s', $response->status(), substr($response->body(), 0, 500))
            );
        }

        return (array) $response->json();
    }

    /**
     * @param  array<string, mixed>  $response
     */
    protected function extractText(array $response): string
    {
        $candidates = $response['candidates'] ?? [];
        if (! is_array($candidates) || empty($candidates)) {
            throw new RuntimeException('Gemini returned no candidates: '.json_encode($response));
        }

        $parts = $candidates[0]['content']['parts'] ?? [];
        if (! is_array($parts) || empty($parts)) {
            throw new RuntimeException('Gemini candidate had no parts: '.json_encode($response));
        }

        $text = '';
        foreach ($parts as $part) {
            if (is_array($part) && isset($part['text'])) {
                $text .= $part['text'];
            }
        }

        $trimmed = trim($text);
        if ($trimmed === '') {
            throw new RuntimeException('Gemini returned empty text');
        }

        return $trimmed;
    }

    /**
     * Decode JSON from Gemini, tolerating ```json fences.
     *
     * @return mixed
     */
    protected function decodeJson(string $text)
    {
        $text = trim($text);

        // Strip ```json ... ``` or ``` ... ``` fences if present.
        if (preg_match('/^```(?:json)?\s*(.+?)\s*```$/is', $text, $m)) {
            $text = $m[1];
        }

        $decoded = json_decode($text, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            return $decoded;
        }

        // Best-effort: try to extract the first JSON array/object substring.
        if (preg_match('/(\[.*\]|\{.*\})/s', $text, $m)) {
            $decoded = json_decode($m[1], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $decoded;
            }
        }

        throw new RuntimeException('Failed to decode Gemini JSON response: '.substr($text, 0, 500));
    }
}
