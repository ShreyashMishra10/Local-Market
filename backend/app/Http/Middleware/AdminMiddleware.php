<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = JWTAuth::user();

        if (!$user || $user->role !== 'admin') {
            return response()->json(['error' => 'Access denied. Admin privileges required.'], 403);
        }

        return $next($request);
    }
}
