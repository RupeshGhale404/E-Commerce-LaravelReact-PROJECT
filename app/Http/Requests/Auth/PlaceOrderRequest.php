<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PlaceOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100'],

            'shipping_address' => ['required', 'array'],
            'shipping_address.full_name' => ['required', 'string', 'max:255'],
            'shipping_address.street' => ['required', 'string', 'max:255'],
            'shipping_address.city' => ['required', 'string', 'max:100'],
            'shipping_address.state' => ['required', 'string', 'max:100'],
            'shipping_address.zip_code' => ['required', 'string', 'max:20'],
            'shipping_address.country' => ['required', 'string', 'max:100'],
            'shipping_address.phone' => ['nullable', 'string', 'max:30'],

            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Your cart is empty.',
            'items.*.product_id.exists' => 'One or more products in your cart no longer exist.',
            'items.*.quantity.min' => 'Quantity must be at least 1 for each item.',
            'shipping_address.full_name.required' => 'Full name is required for shipping.',
            'shipping_address.street.required' => 'Street address is required.',
            'shipping_address.city.required' => 'City is required.',
            'shipping_address.zip_code.required' => 'ZIP/Postal code is required.',
        ];
    }
}