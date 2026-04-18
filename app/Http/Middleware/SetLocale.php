<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * Resolve the locale in this priority order:
     *   1. Session value (user-selected via the switcher)
     *   2. Accept-Language header (first supported match)
     *   3. Config fallback (app.locale)
     */
    public function handle(Request $request, Closure $next): Response
    {
        $supported = (array) config('app.supported_locales', ['en', 'de']);
        $fallback = (string) config('app.locale', 'en');

        // Priority: ?locale=xx query → cookie → session → Accept-Language → config fallback.
        // Query + cookie come first so a user's explicit choice survives even when
        // the session store is unreliable on shared hosting.
        $candidates = [
            $request->query('locale'),
            $request->cookie('locale'),
            $request->session()->get('locale'),
        ];

        $locale = null;
        foreach ($candidates as $candidate) {
            if (is_string($candidate) && in_array($candidate, $supported, true)) {
                $locale = $candidate;
                break;
            }
        }

        if (! $locale) {
            $preferred = $request->getPreferredLanguage($supported);
            $locale = $preferred && in_array($preferred, $supported, true)
                ? $preferred
                : $fallback;
        }

        App::setLocale($locale);

        return $next($request);
    }
}
