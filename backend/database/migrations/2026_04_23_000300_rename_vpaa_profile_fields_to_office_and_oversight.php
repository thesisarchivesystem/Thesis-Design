<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement(<<<'SQL'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'vpaa_profiles' AND column_name = 'department'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'vpaa_profiles' AND column_name = 'office'
    ) THEN
        ALTER TABLE vpaa_profiles RENAME COLUMN department TO office;
    END IF;
END
$$;
SQL);

        DB::statement(<<<'SQL'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'vpaa_profiles' AND column_name = 'college'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'vpaa_profiles' AND column_name = 'area_of_oversight'
    ) THEN
        ALTER TABLE vpaa_profiles RENAME COLUMN college TO area_of_oversight;
    END IF;
END
$$;
SQL);
    }

    public function down(): void
    {
        DB::statement(<<<'SQL'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'vpaa_profiles' AND column_name = 'area_of_oversight'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'vpaa_profiles' AND column_name = 'college'
    ) THEN
        ALTER TABLE vpaa_profiles RENAME COLUMN area_of_oversight TO college;
    END IF;
END
$$;
SQL);

        DB::statement(<<<'SQL'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'vpaa_profiles' AND column_name = 'office'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'vpaa_profiles' AND column_name = 'department'
    ) THEN
        ALTER TABLE vpaa_profiles RENAME COLUMN office TO department;
    END IF;
END
$$;
SQL);
    }
};
