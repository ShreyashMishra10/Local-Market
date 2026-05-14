<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Notification extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'notifications';

    protected $fillable = [
        'user_id', 'type', 'title', 'message', 'data', 'is_read', 'read_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    protected $attributes = [
        'is_read' => false,
        'data' => [],
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
