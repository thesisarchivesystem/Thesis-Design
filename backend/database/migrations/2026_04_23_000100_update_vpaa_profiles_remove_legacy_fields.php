<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vpaa_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('vpaa_profiles', 'department')) {
                $table->string('department')->nullable()->after('employee_id');
            }

            if (!Schema::hasColumn('vpaa_profiles', 'college')) {
                $table->string('college')->nullable()->after('department');
            }
        });

        if (Schema::hasColumn('vpaa_profiles', 'office') && Schema::hasColumn('vpaa_profiles', 'college')) {
            DB::table('vpaa_profiles')
                ->whereNull('college')
                ->update([
                    'college' => DB::raw('office'),
                ]);
        }

        Schema::table('vpaa_profiles', function (Blueprint $table) {
            $columnsToDrop = array_values(array_filter([
                Schema::hasColumn('vpaa_profiles', 'mobile') ? 'mobile' : null,
                Schema::hasColumn('vpaa_profiles', 'office') ? 'office' : null,
                Schema::hasColumn('vpaa_profiles', 'supervised_units') ? 'supervised_units' : null,
                Schema::hasColumn('vpaa_profiles', 'signature_title') ? 'signature_title' : null,
            ]));

            if ($columnsToDrop !== []) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }

    public function down(): void
    {
        Schema::table('vpaa_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('vpaa_profiles', 'mobile')) {
                $table->string('mobile')->nullable()->after('employee_id');
            }

            if (!Schema::hasColumn('vpaa_profiles', 'office')) {
                $table->string('office')->nullable()->after('department');
            }

            if (!Schema::hasColumn('vpaa_profiles', 'supervised_units')) {
                $table->string('supervised_units')->nullable()->after('term_start');
            }

            if (!Schema::hasColumn('vpaa_profiles', 'signature_title')) {
                $table->string('signature_title')->nullable()->after('office_hours');
            }
        });

        Schema::table('vpaa_profiles', function (Blueprint $table) {
            if (Schema::hasColumn('vpaa_profiles', 'college')) {
                $table->dropColumn('college');
            }

            if (Schema::hasColumn('vpaa_profiles', 'department')) {
                $table->dropColumn('department');
            }
        });
    }
};
