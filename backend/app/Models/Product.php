<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Product extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'products';

    protected $fillable = [
        'vendor_id', 'category_id', 'title', 'description', 'price',
        'original_price', 'discount_percentage', 'stock', 'images',
        'tags', 'is_active', 'is_approved', 'is_featured', 'rating',
        'total_reviews', 'total_sold', 'specifications', 'weight',
        'dimensions', 'sku', 'location', 'city',
    ];

    // MongoDB stores arrays (images, tags, specifications, etc.) natively
    protected $casts = [
        'price'               => 'float',
        'original_price'      => 'float',
        'discount_percentage' => 'float',
        'stock'               => 'integer',
        'is_active'           => 'boolean',
        'is_approved'         => 'boolean',
        'is_featured'         => 'boolean',
        'rating'              => 'float',
        'total_reviews'       => 'integer',
        'total_sold'          => 'integer',
    ];

    protected $attributes = [
        'is_active'     => true,
        'is_approved'   => false,
        'is_featured'   => false,
        'rating'        => 0.0,
        'total_reviews' => 0,
        'total_sold'    => 0,
    ];

    public function vendor()   { return $this->belongsTo(Vendor::class, 'vendor_id'); }
    public function category() { return $this->belongsTo(Category::class, 'category_id'); }
    public function reviews()  { return $this->hasMany(Review::class, 'product_id'); }
}
