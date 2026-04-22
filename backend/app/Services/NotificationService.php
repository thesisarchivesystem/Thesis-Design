<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    public function __construct(private AblyService $ably) {}

    public function notify(
        User $recipient,
        string $type,
        string $title,
        ?string $body = null,
        array $data = [],
    ): Notification {
        $recentDuplicate = Notification::query()
            ->where('user_id', $recipient->id)
            ->where('type', $type)
            ->where('title', $title)
            ->where('body', $body)
            ->where('created_at', '>=', now()->subSeconds(10))
            ->latest('created_at')
            ->first();

        $notification = $recentDuplicate ?? Notification::create([
            'user_id' => $recipient->id,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'data' => $data,
        ]);

        $this->ably->publishNotification($recipient->id, 'notification.new', [
            'id' => $notification->id,
            'type' => $notification->type,
            'title' => $notification->title,
            'body' => $notification->body,
            'data' => $notification->data,
            'read_at' => optional($notification->read_at)?->toISOString(),
            'created_at' => optional($notification->created_at)?->toISOString(),
        ]);

        return $notification;
    }
}
