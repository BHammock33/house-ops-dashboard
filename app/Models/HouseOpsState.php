<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HouseOpsState extends Model
{
    protected $fillable = ['user_id', 'state'];

    protected $casts = [
        'state' => 'array',
    ];
}
