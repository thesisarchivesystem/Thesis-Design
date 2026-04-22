<?php

namespace App\Services;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DailyQuoteService
{
    public function getTodayQuote(): ?array
    {
        $today = now()->toDateString();

        return Cache::remember(
            "zenquotes.daily.{$today}",
            now()->endOfDay(),
            fn () => $this->fetchTodayQuote($today)
        );
    }

    private function fetchTodayQuote(string $today): ?array
    {
        $baseUrl = rtrim((string) config('services.zenquotes.base_url', 'https://zenquotes.io/api'), '/');
        $apiKey = trim((string) config('services.zenquotes.key', ''));
        $endpoint = $apiKey === ''
            ? "{$baseUrl}/today"
            : "{$baseUrl}/today/{$apiKey}";

        try {
            $response = Http::acceptJson()
                ->timeout(8)
                ->get($endpoint)
                ->throw();
        } catch (\Throwable $exception) {
            Log::warning('Failed to fetch ZenQuotes daily quote.', [
                'endpoint' => $endpoint,
                'message' => $exception->getMessage(),
            ]);

            return null;
        }

        $payload = $response->json();

        if (!is_array($payload) || !isset($payload[0]) || !is_array($payload[0])) {
            Log::warning('ZenQuotes daily quote response had an unexpected format.', [
                'payload' => $payload,
            ]);

            return null;
        }

        $quote = $payload[0];
        $body = isset($quote['q']) ? trim((string) $quote['q']) : '';
        $author = isset($quote['a']) ? trim((string) $quote['a']) : '';

        if ($body === '' || $author === '') {
            return null;
        }

        return [
            'id' => "zenquotes-{$today}",
            'body' => $body,
            'author' => $author,
            'quote_date' => $today,
            'is_active' => true,
            'source' => 'zenquotes',
            'attribution_text' => 'Inspirational quotes provided by ZenQuotes API',
            'attribution_url' => 'https://zenquotes.io/',
            'fetched_at' => Carbon::now()->toISOString(),
        ];
    }
}
