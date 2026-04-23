<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('faculty_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('faculty_profiles', 'college')) {
                $table->string('college')->nullable()->after('department');
            }
        });
    }

    public function down(): void
    {
        Schema::table('faculty_profiles', function (Blueprint $table) {
            if (Schema::hasColumn('faculty_profiles', 'college')) {
                $table->dropColumn('college');
            }
        });
    }
};
