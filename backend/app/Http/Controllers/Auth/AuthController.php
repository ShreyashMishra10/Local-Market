<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone'    => 'nullable|string|max:20',
            'role'     => 'in:customer,vendor',
            // Vendor-specific
            'shop_name'    => 'required_if:role,vendor|string|max:255',
            'shop_address' => 'required_if:role,vendor|string',
            'city'         => 'required_if:role,vendor|string',
            'category'     => 'required_if:role,vendor|string',
            'description'  => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'phone'    => $request->phone,
            'address'  => $request->address,
            'city'     => $request->city,
            'role'     => $request->role ?? 'customer',
        ]);

        if ($request->role === 'vendor') {
            Vendor::create([
                'user_id'      => $user->id,
                'vendor_name'  => $request->name,
                'shop_name'    => $request->shop_name,
                'phone'        => $request->phone,
                'email'        => $request->email,
                'shop_address' => $request->shop_address,
                'city'         => $request->city,
                'category'     => $request->category,
                'description'  => $request->description,
            ]);
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Registration successful',
            'user'    => $this->formatUser($user),
            'token'   => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        $user = JWTAuth::user();

        if (!$user->is_active) {
            return response()->json(['error' => 'Your account has been suspended'], 403);
        }

        return response()->json([
            'message'    => 'Login successful',
            'user'       => $this->formatUser($user),
            'token'      => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
        ]);
    }

    public function logout(Request $request)
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json(['message' => 'Logged out successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Could not log out'], 500);
        }
    }

    public function refresh(Request $request)
    {
        try {
            $token = JWTAuth::refresh(JWTAuth::getToken());
            return response()->json([
                'token'      => $token,
                'token_type' => 'bearer',
                'expires_in' => config('jwt.ttl') * 60,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Token refresh failed'], 401);
        }
    }

    public function me(Request $request)
    {
        $user = JWTAuth::user();
        $userData = $this->formatUser($user);

        if ($user->isVendor()) {
            $userData['vendor'] = $user->vendor;
        }

        return response()->json(['user' => $userData]);
    }

    public function updateProfile(Request $request)
    {
        $user = JWTAuth::user();

        $validator = Validator::make($request->all(), [
            'name'    => 'sometimes|string|max:255',
            'phone'   => 'sometimes|string|max:20',
            'address' => 'sometimes|string',
            'city'    => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->update($request->only(['name', 'phone', 'address', 'city']));

        return response()->json([
            'message' => 'Profile updated successfully',
            'user'    => $this->formatUser($user->fresh()),
        ]);
    }

    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = JWTAuth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['error' => 'Current password is incorrect'], 400);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password changed successfully']);
    }

    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // Return success even if user not found (security)
            return response()->json(['message' => 'Password reset link sent if email exists']);
        }

        $token = Str::random(64);
        // In production, store token and send email
        // Mail::to($user->email)->send(new ForgotPasswordMail($token));

        return response()->json(['message' => 'Password reset link sent to your email']);
    }

    private function formatUser(User $user): array
    {
        return [
            'id'                => $user->id,
            'name'              => $user->name,
            'email'             => $user->email,
            'phone'             => $user->phone,
            'address'           => $user->address,
            'city'              => $user->city,
            'role'              => $user->role,
            'profile_picture'   => $user->profile_picture,
            'is_email_verified' => $user->is_email_verified,
            'is_active'         => $user->is_active,
            'created_at'        => $user->created_at,
        ];
    }
}
