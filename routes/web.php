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

Route::post('/locale', function (\Illuminate\Http\Request $request) {
    $supported = (array) config('app.supported_locales', ['en', 'de']);
    $locale = (string) $request->input('locale');
    if (in_array($locale, $supported, true)) {
        $request->session()->put('locale', $locale);
    }

    return back();
})->name('locale.set');

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
