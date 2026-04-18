<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subtopics', function (Blueprint $table) {
            $table->unsignedInteger('search_volume')->nullable()->after('long_tail_keyword');
            $table->decimal('cpc', 10, 2)->nullable()->after('search_volume');
            $table->string('competition', 16)->nullable()->after('cpc');
            $table->unsignedTinyInteger('competition_index')->nullable()->after('competition');
            $table->decimal('low_bid', 10, 2)->nullable()->after('competition_index');
            $table->decimal('high_bid', 10, 2)->nullable()->after('low_bid');
        });
    }

    public function down(): void
    {
        Schema::table('subtopics', function (Blueprint $table) {
            $table->dropColumn([
                'search_volume',
                'cpc',
                'competition',
                'competition_index',
                'low_bid',
                'high_bid',
            ]);
        });
    }
};
