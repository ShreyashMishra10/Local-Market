<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Cart extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'carts';

    protected $fillable = [
        'user_id', 'items', 'coupon_code', 'discount',
    ];

    // MongoDB stores items array natively
    protected $casts = [
        'discount' => 'float',
    ];

    protected $attributes = [
        'discount' => 0,
    ];

    public function user() { return $this->belongsTo(User::class, 'user_id'); }

    public function getSubtotalAttribute(): float
    {
        $items = $this->items ?? [];
        return collect($items)->sum(fn($item) => ($item['price'] ?? 0) * ($item['quantity'] ?? 1));
    }

    public function getTotalAttribute(): float
    {
        return $this->subtotal - ($this->discount ?? 0);
    }

    public function getItemCountAttribute(): int
    {
        $items = $this->items ?? [];
        return (int) collect($items)->sum(fn($item) => $item['quantity'] ?? 1);
    }
}
