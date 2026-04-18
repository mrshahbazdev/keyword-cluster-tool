<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'topic' => ['required', 'string', 'min:2', 'max:255'],
            'website' => ['required', 'string', 'min:2', 'max:255'],
        ];
    }
}
