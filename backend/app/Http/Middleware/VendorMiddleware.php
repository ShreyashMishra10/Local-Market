<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class VendorMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = JWTAuth::user();

        if (!$user || !in_array($user->role, ['vendor', 'admin'])) {
            return response()->json(['error' => 'Access denied. Vendor privileges required.'], 403);
        }

        if ($user->role === 'vendor') {
            $vendor = $user->vendor;
            if (!$vendor) {
                return response()->json(['error' => 'Vendor profile not found'], 404);
            }
            if (!$vendor->is_approved) {
                return response()->json(['error' => 'Your vendor account is pending approval'], 403);
            }
        }

        return $next($request);
    }
}
