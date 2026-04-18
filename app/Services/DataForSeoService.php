<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DataForSeoService
{
    protected string $baseUrl;

    protected string $login;

    protected string $password;

    protected int $timeout;

    protected int $cacheTtl;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('services.dataforseo.base_url', 'https://api.dataforseo.com'), '/');
        $this->login = (string) config('services.dataforseo.login', '');
        $this->password = (string) config('services.dataforseo.password', '');
        $this->timeout = (int) config('services.dataforseo.timeout', 30);
        $this->cacheTtl = (int) config('services.dataforseo.cache_ttl', 86400);
    }

    public function isConfigured(): bool
    {
        return $this->login !== '' && $this->password !== '';
    }

    /**
     * Fetch Google Ads search volume / CPC / competition for a list of keywords.
     * Returns a map keyed by lowercased keyword.
     *
     * @param  string[]  $keywords
     * @return array<string, array{search_volume:?int,cpc:?float,competition:?string,competition_index:?int,low_bid:?float,high_bid:?float}>
     */
    public function searchVolume(array $keywords, int $locationCode = 2840, string $languageCode = 'en'): array
    {
        $keywords = array_values(array_filter(array_map(
            fn ($k) => trim((string) $k),
            $keywords,
        )));

        if (empty($keywords) || ! $this->isConfigured()) {
            return [];
        }

        $cacheKey = 'dfs:sv:'.md5(implode('|', $keywords).'|'.$locationCode.'|'.$languageCode);

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($keywords, $locationCode, $languageCode) {
            try {
                $response = Http::withBasicAuth($this->login, $this->password)
                    ->timeout($this->timeout)
                    ->acceptJson()
                    ->asJson()
                    ->post($this->baseUrl.'/v3/keywords_data/google_ads/search_volume/live', [[
                        'keywords' => $keywords,
                        'location_code' => $locationCode,
                        'language_code' => $languageCode,
                    ]]);

                if (! $response->successful()) {
                    Log::warning('DataForSEO search_volume failed', [
                        'status' => $response->status(),
                        'body' => substr($response->body(), 0, 500),
                    ]);

                    return [];
                }

                $json = (array) $response->json();
                $result = data_get($json, 'tasks.0.result') ?? [];

                $map = [];
                foreach ($result as $row) {
                    $key = strtolower(trim((string) ($row['keyword'] ?? '')));
                    if ($key === '') {
                        continue;
                    }
                    $map[$key] = [
                        'search_volume' => isset($row['search_volume']) ? (int) $row['search_volume'] : null,
                        'cpc' => isset($row['cpc']) ? (float) $row['cpc'] : null,
                        'competition' => isset($row['competition']) ? (string) $row['competition'] : null,
                        'competition_index' => isset($row['competition_index']) ? (int) $row['competition_index'] : null,
                        'low_bid' => isset($row['low_top_of_page_bid']) ? (float) $row['low_top_of_page_bid'] : null,
                        'high_bid' => isset($row['high_top_of_page_bid']) ? (float) $row['high_top_of_page_bid'] : null,
                    ];
                }

                return $map;
            } catch (\Throwable $e) {
                Log::warning('DataForSEO search_volume exception: '.$e->getMessage());

                return [];
            }
        });
    }
}
