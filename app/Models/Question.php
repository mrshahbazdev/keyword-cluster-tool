<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'subtopic_id',
        'question',
        'answer',
        'sort_order',
    ];

    public function subtopic(): BelongsTo
    {
        return $this->belongsTo(Subtopic::class);
    }
}
