<?php

namespace Database\Seeders;

use App\Models\VpaaProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class VpaaSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'vpaa@tup.edu.ph'],
            [
                'first_name' => 'Dr. Alicia D.',
                'last_name' => 'Navarro',
                'name'     => 'Dr. Alicia D. Navarro',
                'password' => Hash::make('password'),
                'role'     => 'vpaa',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $user->update([
            'first_name' => 'Dr. Alicia D.',
            'last_name' => 'Navarro',
        ]);

        VpaaProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'employee_id' => 'VPAA-' . now()->format('y') . '-0001',
                'office' => 'Office of the VPAA',
                'area_of_oversight' => 'Academic Affairs',
                'role_title' => 'Vice President for Academic Affairs',
                'office_hours' => 'Mon to Fri 8:00 AM - 5:00 PM',
            ]
        );

        $this->call(DailyQuoteSeeder::class);
    }
}
