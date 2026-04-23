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
        WHERE table_name = 'vpaa_profiles' AND column_name = 'office'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'vpaa_profiles' AND column_name = 'college'
    ) THEN
        ALTER TABLE vpaa_profiles RENAME COLUMN office TO college;
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
        WHERE table_name = 'vpaa_profiles' AND column_name = 'mobile'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'vpaa_profiles' AND column_name = 'department'
    ) THEN
        ALTER TABLE vpaa_profiles RENAME COLUMN mobile TO department;
    END IF;
END
$$;
SQL);

        DB::statement('ALTER TABLE vpaa_profiles DROP COLUMN IF EXISTS supervised_units');
        DB::statement('ALTER TABLE vpaa_profiles DROP COLUMN IF EXISTS signature_title');
        DB::statement('ALTER TABLE vpaa_profiles DROP COLUMN IF EXISTS term_start');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE vpaa_profiles ADD COLUMN IF NOT EXISTS term_start DATE NULL');
        DB::statement('ALTER TABLE vpaa_profiles ADD COLUMN IF NOT EXISTS supervised_units VARCHAR(255) NULL');
        DB::statement('ALTER TABLE vpaa_profiles ADD COLUMN IF NOT EXISTS signature_title VARCHAR(255) NULL');

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
        WHERE table_name = 'vpaa_profiles' AND column_name = 'office'
    ) THEN
        ALTER TABLE vpaa_profiles RENAME COLUMN college TO office;
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
        WHERE table_name = 'vpaa_profiles' AND column_name = 'department'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'vpaa_profiles' AND column_name = 'mobile'
    ) THEN
        ALTER TABLE vpaa_profiles RENAME COLUMN department TO mobile;
    END IF;
END
$$;
SQL);
    }
};
