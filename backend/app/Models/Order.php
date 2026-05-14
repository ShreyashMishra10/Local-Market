<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Order extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'orders';

    protected $fillable = [
        'customer_id', 'vendor_id', 'order_number', 'items',
        'subtotal', 'discount', 'shipping_fee', 'total',
        'status', 'payment_status', 'payment_method', 'payment_id',
        'shipping_address', 'billing_address', 'coupon_code',
        'notes', 'tracking_number', 'estimated_delivery',
        'status_history', 'cancelled_reason',
    ];

    // MongoDB stores arrays (items, shipping_address, status_history) natively
    protected $casts = [
        'subtotal'           => 'float',
        'discount'           => 'float',
        'shipping_fee'       => 'float',
        'total'              => 'float',
        'estimated_delivery' => 'datetime',
    ];

    protected $attributes = [
        'status'         => 'pending',
        'payment_status' => 'pending',
        'discount'       => 0,
        'shipping_fee'   => 0,
    ];

    public const STATUS_PENDING   = 'pending';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_SHIPPED   = 'shipped';
    public const STATUS_DELIVERED = 'delivered';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_REFUNDED  = 'refunded';

    public function customer() { return $this->belongsTo(User::class, 'customer_id'); }
    public function vendor()   { return $this->belongsTo(Vendor::class, 'vendor_id'); }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = 'ORD-' . strtoupper(uniqid());
            }
        });
    }
}
