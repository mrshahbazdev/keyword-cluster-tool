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

        $locale = $request->session()->get('locale');

        if (! $locale || ! in_array($locale, $supported, true)) {
            $preferred = $request->getPreferredLanguage($supported);
            $locale = $preferred && in_array($preferred, $supported, true)
                ? $preferred
                : $fallback;
        }

        App::setLocale($locale);

        return $next($request);
    }
}
