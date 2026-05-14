<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Coupon extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'coupons';

    protected $fillable = [
        'code', 'type', 'value', 'min_order_amount', 'max_discount',
        'vendor_id', 'category_id', 'usage_limit', 'used_count',
        'is_active', 'expires_at', 'description', 'applicable_products',
    ];

    // MongoDB stores arrays natively — no 'array' cast needed
    protected $casts = [
        'value'            => 'float',
        'min_order_amount' => 'float',
        'max_discount'     => 'float',
        'usage_limit'      => 'integer',
        'used_count'       => 'integer',
        'is_active'        => 'boolean',
        'expires_at'       => 'datetime',
    ];

    protected $attributes = [
        'type'       => 'percentage',
        'used_count' => 0,
        'is_active'  => true,
    ];

    public function isValid(): bool
    {
        if (!$this->is_active) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        if ($this->usage_limit && $this->used_count >= $this->usage_limit) return false;
        return true;
    }

    public function calculateDiscount(float $amount): float
    {
        if ($this->min_order_amount && $amount < $this->min_order_amount) return 0;

        $discount = $this->type === 'percentage'
            ? ($amount * $this->value / 100)
            : $this->value;

        if ($this->max_discount) {
            $discount = min($discount, $this->max_discount);
        }

        return $discount;
    }
}
