<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class NotificationController extends Controller
{
    public function index()
    {
        $user          = JWTAuth::user();
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $unreadCount = Notification::where('user_id', $user->id)->where('is_read', false)->count();

        return response()->json(['notifications' => $notifications, 'unread_count' => $unreadCount]);
    }

    public function markRead($id)
    {
        $user         = JWTAuth::user();
        $notification = Notification::where('user_id', $user->id)->find($id);

        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        $notification->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'Notification marked as read']);
    }

    public function markAllRead()
    {
        $user = JWTAuth::user();
        Notification::where('user_id', $user->id)->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    public function destroy($id)
    {
        $user = JWTAuth::user();
        Notification::where('user_id', $user->id)->find($id)?->delete();

        return response()->json(['message' => 'Notification deleted']);
    }
}
