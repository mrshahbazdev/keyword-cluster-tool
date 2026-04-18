<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [ProjectController::class, 'index'])
    ->middleware(['auth'])
    ->name('dashboard');

$localeHandler = function (\Illuminate\Http\Request $request, ?string $code = null) {
    $supported = (array) config('app.supported_locales', ['en', 'de']);
    $locale = (string) ($code ?? $request->input('locale'));

    if (! in_array($locale, $supported, true)) {
        return back();
    }

    $request->session()->put('locale', $locale);

    // Also drop a long-lived cookie so the preference survives even when the
    // session store is flaky (shared hosting quirks, different session domains).
    // 1 year, accessible to JS, available across the whole site.
    $cookie = cookie('locale', $locale, 60 * 24 * 365, '/', null, null, false);

    return back()->withCookie($cookie);
};

Route::post('/locale', $localeHandler)->name('locale.set');
Route::get('/locale/{code}', $localeHandler)->name('locale.set.get');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::get('/projects/create', [ProjectController::class, 'create'])->name('projects.create');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{project}', [ProjectController::class, 'show'])->name('projects.show');
    Route::get('/projects/{project}/status', [ProjectController::class, 'status'])->name('projects.status');
    Route::post('/projects/{project}/retry', [ProjectController::class, 'retry'])->name('projects.retry');
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');
    Route::get('/projects/{project}/export/pillar', [ProjectController::class, 'exportPillar'])->name('projects.export.pillar');
    Route::get('/projects/{project}/export/cluster/{subtopic}', [ProjectController::class, 'exportCluster'])->name('projects.export.cluster');
});

require __DIR__.'/auth.php';
