<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomebaseState extends Model
{
    protected $table = 'homebase_states';

    protected $fillable = ['user_id', 'state'];

    protected $casts = [
        'state' => 'array',
    ];
}
