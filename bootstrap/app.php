<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::updateOrCreate(
            ['email' => 'admin@shop.com'],
            [
                'name' => 'Store Admin',
                'email' => 'admin@shop.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // Sample customer
        User::updateOrCreate(
            ['email' => 'customer@shop.com'],
            [
                'name' => 'Jane Customer',
                'email' => 'customer@shop.com',
                'password' => Hash::make('password'),
                'role' => 'customer',
                'email_verified_at' => now(),
            ]
        );

        // Categories
        $categories = [
            ['name' => 'Electronics', 'slug' => 'electronics', 'description' => 'Gadgets and electronic devices'],
            ['name' => 'Clothing', 'slug' => 'clothing', 'description' => 'Apparel and fashion'],
            ['name' => 'Books', 'slug' => 'books', 'description' => 'Physical and digital books'],
            ['name' => 'Home & Garden', 'slug' => 'home-garden', 'description' => 'Home improvement and garden supplies'],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['slug' => $cat['slug']], $cat);
        }

        $electronics = Category::where('slug', 'electronics')->first();
        $clothing = Category::where('slug', 'clothing')->first();
        $books = Category::where('slug', 'books')->first();

        // Sample products
        $products = [
            [
                'category_id' => $electronics->id,
                'name' => 'Wireless Noise-Cancelling Headphones',
                'slug' => 'wireless-noise-cancelling-headphones',
                'description' => 'Premium over-ear headphones with 30-hour battery life and active noise cancellation. Perfect for work, travel, and everyday listening.',
                'price' => 149.99,
                'stock_quantity' => 50,
                'image_path' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $electronics->id,
                'name' => 'Smart Watch Pro',
                'slug' => 'smart-watch-pro',
                'description' => 'Feature-packed smartwatch with health monitoring, GPS, and 7-day battery. Water resistant to 50 meters.',
                'price' => 299.99,
                'stock_quantity' => 30,
                'image_path' => 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $electronics->id,
                'name' => 'Mechanical Keyboard',
                'slug' => 'mechanical-keyboard',
                'description' => 'Compact tenkeyless mechanical keyboard with RGB backlight and tactile switches. USB-C connectivity.',
                'price' => 89.99,
                'stock_quantity' => 75,
                'image_path' => 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $clothing->id,
                'name' => 'Premium Cotton T-Shirt',
                'slug' => 'premium-cotton-t-shirt',
                'description' => '100% organic cotton, pre-shrunk and ultra-soft. Available in multiple colors. Unisex fit.',
                'price' => 29.99,
                'stock_quantity' => 200,
                'image_path' => 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=600&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $clothing->id,
                'name' => 'Running Shoes',
                'slug' => 'running-shoes',
                'description' => 'Lightweight and breathable running shoes with responsive cushioning and durable outsole.',
                'price' => 119.99,
                'stock_quantity' => 60,
                'image_path' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $books->id,
                'name' => 'Clean Code: A Handbook',
                'slug' => 'clean-code-handbook',
                'description' => 'A handbook of agile software craftsmanship. Essential reading for every professional developer.',
                'price' => 39.99,
                'stock_quantity' => 100,
                'image_path' => 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop',
                'is_active' => true,
            ],
            [
                'category_id' => $electronics->id,
                'name' => 'USB-C Hub 7-in-1',
                'slug' => 'usb-c-hub-7-in-1',
                'description' => 'Expand your laptop with 4K HDMI, 3x USB-A, SD card reader, and 100W PD charging.',
                'price' => 49.99,
                'stock_quantity' => 3, // Low stock for demo
                'image_path' => 'https://images.unsplash.com/photo-1625895197185-efcec01cffe0?w=600&auto=format&fit=crop',
                'is_active' => true,
            ],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(['slug' => $product['slug']], $product);
        }

        $this->command->info('Database seeded successfully!');
        $this->command->info('Admin: admin@shop.com / password');
        $this->command->info('Customer: customer@shop.com / password');
    }
}