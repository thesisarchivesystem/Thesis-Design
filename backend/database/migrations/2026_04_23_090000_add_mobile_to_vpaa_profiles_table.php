<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('vpaa_profiles')) {
            return;
        }

        if (!Schema::hasColumn('vpaa_profiles', 'mobile')) {
            Schema::table('vpaa_profiles', function (Blueprint $table) {
                $table->string('mobile')->nullable();
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('vpaa_profiles')) {
            return;
        }

        if (Schema::hasColumn('vpaa_profiles', 'mobile')) {
            Schema::table('vpaa_profiles', function (Blueprint $table) {
                $table->dropColumn('mobile');
            });
        }
    }
};
