<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Review extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'reviews';

    protected $fillable = [
        'user_id', 'product_id', 'vendor_id', 'order_id',
        'rating', 'comment', 'images', 'is_verified',
        'helpful_count', 'reply', 'reply_at',
    ];

    // MongoDB stores images array natively
    protected $casts = [
        'rating'        => 'integer',
        'is_verified'   => 'boolean',
        'helpful_count' => 'integer',
        'reply_at'      => 'datetime',
    ];

    protected $attributes = [
        'is_verified'   => false,
        'helpful_count' => 0,
    ];

    public function user()    { return $this->belongsTo(User::class, 'user_id'); }
    public function product() { return $this->belongsTo(Product::class, 'product_id'); }
}
