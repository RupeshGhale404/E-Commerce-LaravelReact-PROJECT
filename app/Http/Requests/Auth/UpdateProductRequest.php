<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        $productId = $this->route('product')?->id;

        return [
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'name' => ['sometimes', 'string', 'min:2', 'max:255'],
            'slug' => ['sometimes', 'string', Rule::unique('products', 'slug')->ignore($productId)],
            'description' => ['nullable', 'string', 'max:5000'],
            'price' => ['sometimes', 'numeric', 'min:0.01', 'max:999999.99'],
            'stock_quantity' => ['sometimes', 'integer', 'min:0'],
            'image_path' => ['nullable', 'string', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}