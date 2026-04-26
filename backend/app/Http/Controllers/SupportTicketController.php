<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupportTicketController extends Controller
{
    public function __construct(private ActivityLogService $logger) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'category' => 'required|string|max:255',
            'message' => 'required|string|min:10|max:5000',
        ]);

        $user = $request->user();

        $ticket = SupportTicket::create([
            'user_id' => $user->id,
            'requester_role' => $user->role,
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'category' => $validated['category'],
            'message' => $validated['message'],
            'status' => 'open',
        ]);

        $this->logger->log($user, 'support.ticket_created', 'support_ticket', $ticket->id, [
            'category' => $ticket->category,
            'requester_role' => $ticket->requester_role,
        ]);

        return response()->json([
            'message' => 'Support ticket submitted successfully.',
            'data' => $ticket,
        ], 201);
    }
}