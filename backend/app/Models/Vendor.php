<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Vendor extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'vendors';

    protected $fillable = [
        'user_id', 'shop_name', 'vendor_name', 'phone', 'email',
        'shop_address', 'city', 'category', 'shop_logo', 'banner_image',
        'description', 'is_approved', 'is_active', 'rating', 'total_reviews',
        'total_sales', 'social_links', 'location', 'tags',
    ];

    // MongoDB stores arrays (social_links, location, tags) natively
    protected $casts = [
        'is_approved'   => 'boolean',
        'is_active'     => 'boolean',
        'rating'        => 'float',
        'total_reviews' => 'integer',
        'total_sales'   => 'integer',
    ];

    protected $attributes = [
        'is_approved'   => false,
        'is_active'     => true,
        'rating'        => 0.0,
        'total_reviews' => 0,
        'total_sales'   => 0,
    ];

    public function user()     { return $this->belongsTo(User::class, 'user_id'); }
    public function products() { return $this->hasMany(Product::class, 'vendor_id'); }
    public function orders()   { return $this->hasMany(Order::class, 'vendor_id'); }
}
