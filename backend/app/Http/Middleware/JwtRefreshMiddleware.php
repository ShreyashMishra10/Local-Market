<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenExpiredException;

class JwtRefreshMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        try {
            JWTAuth::parseToken()->authenticate();
        } catch (TokenExpiredException $e) {
            try {
                $token = JWTAuth::refresh(JWTAuth::getToken());
                $user  = JWTAuth::setToken($token)->toUser();
                $request->headers->set('Authorization', 'Bearer ' . $token);
                $response = $next($request);
                return $response->header('Authorization', $token);
            } catch (\Exception $e) {
                return response()->json(['error' => 'Token refresh failed'], 401);
            }
        }

        return $next($request);
    }
}
