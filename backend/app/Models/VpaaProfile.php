<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class VpaaProfile extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'employee_id',
        'office',
        'area_of_oversight',
        'role_title',
        'office_hours',
    ];

    protected static function booted(): void
    {
        static::creating(function (VpaaProfile $profile) {
            if (blank($profile->employee_id)) {
                $profile->employee_id = static::generateEmployeeId();
            }
        });

        static::saving(function (VpaaProfile $profile) {
            $profile->employee_id = static::normalizeEmployeeId($profile->employee_id, $profile->id);
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public static function generateEmployeeId(?Carbon $date = null): string
    {
        $date ??= now();
        $yearSuffix = $date->format('y');
        $prefix = "VPAA-{$yearSuffix}-";

        $latest = static::query()
            ->where('employee_id', 'like', $prefix . '%')
            ->orderByDesc('employee_id')
            ->value('employee_id');

        $nextNumber = 1;

        if (is_string($latest) && preg_match('/^VPAA-\d{2}-(\d{4})$/', $latest, $matches) === 1) {
            $nextNumber = ((int) $matches[1]) + 1;
        }

        return $prefix . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
    }

    public static function normalizeEmployeeId(?string $employeeId, ?string $currentId = null): string
    {
        if (is_string($employeeId) && preg_match('/^VPAA-\d{2}-\d{4}$/', $employeeId) === 1) {
            return $employeeId;
        }

        $existingFormattedId = static::query()
            ->when($currentId, fn ($query) => $query->where('id', '!=', $currentId))
            ->where('employee_id', 'like', 'VPAA-%')
            ->orderByDesc('employee_id')
            ->value('employee_id');

        if (is_string($existingFormattedId) && preg_match('/^VPAA-\d{2}-\d{4}$/', $existingFormattedId) === 1) {
            $yearSuffix = substr($existingFormattedId, 5, 2);
            $sequence = (int) substr($existingFormattedId, -4);

            return "VPAA-{$yearSuffix}-" . str_pad((string) ($sequence + 1), 4, '0', STR_PAD_LEFT);
        }

        return static::generateEmployeeId();
    }
}
