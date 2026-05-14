<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'jwt.auth'  => \App\Http\Middleware\JwtMiddleware::class,
            'jwt.refresh' => \App\Http\Middleware\JwtRefreshMiddleware::class,
            'role.vendor' => \App\Http\Middleware\VendorMiddleware::class,
            'role.admin' => \App\Http\Middleware\AdminMiddleware::class,
        ]);

        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (\PHPOpenSourceSaver\JWTAuth\Exceptions\TokenExpiredException $e) {
            return response()->json(['error' => 'Token has expired'], 401);
        });
        $exceptions->render(function (\PHPOpenSourceSaver\JWTAuth\Exceptions\TokenInvalidException $e) {
            return response()->json(['error' => 'Token is invalid'], 401);
        });
        $exceptions->render(function (\PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException $e) {
            return response()->json(['error' => 'Token is absent'], 401);
        });
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        });
        $exceptions->render(function (\Illuminate\Auth\Access\AuthorizationException $e) {
            return response()->json(['error' => 'Forbidden'], 403);
        });
        $exceptions->render(function (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        });
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e) {
            return response()->json(['error' => 'Resource not found'], 404);
        });
    })->create();
