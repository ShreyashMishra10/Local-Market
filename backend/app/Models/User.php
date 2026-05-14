<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;
use Illuminate\Notifications\Notifiable;

class User extends Model implements AuthenticatableContract, JWTSubject
{
    use Authenticatable, Notifiable;

    protected $connection = 'mongodb';
    protected $collection = 'users';

    protected $fillable = [
        'name', 'email', 'password', 'phone', 'address', 'city',
        'profile_picture', 'role', 'is_active', 'is_email_verified',
        'email_verified_at', 'remember_token', 'google_id',
        'wishlist', 'notification_preferences',
    ];

    protected $hidden = ['password', 'remember_token'];

    // MongoDB stores arrays natively — no 'array' cast needed
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active'         => 'boolean',
        'is_email_verified' => 'boolean',
    ];

    protected $attributes = [
        'role'              => 'customer',
        'is_active'         => true,
        'is_email_verified' => false,
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'role'  => $this->role,
            'name'  => $this->name,
            'email' => $this->email,
        ];
    }

    public function isAdmin(): bool  { return $this->role === 'admin'; }
    public function isVendor(): bool { return $this->role === 'vendor'; }
    public function isCustomer(): bool { return $this->role === 'customer'; }

    public function vendor()  { return $this->hasOne(Vendor::class, 'user_id'); }
    public function orders()  { return $this->hasMany(Order::class, 'customer_id'); }
    public function reviews() { return $this->hasMany(Review::class, 'user_id'); }
    public function cart()    { return $this->hasOne(Cart::class, 'user_id'); }
}
