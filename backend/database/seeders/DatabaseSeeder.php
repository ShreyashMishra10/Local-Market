<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Category;
use App\Models\Product;
use App\Models\Coupon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Clear all collections first to avoid duplicates
        User::truncate();
        Vendor::truncate();
        Category::truncate();
        Product::truncate();
        Coupon::truncate();

        // Create Admin
        User::create([
            'name'              => 'Admin User',
            'email'             => 'admin@localmarket.com',
            'password'          => Hash::make('password123'),
            'role'              => 'admin',
            'phone'             => '+91-9999999999',
            'is_email_verified' => true,
            'is_active'         => true,
        ]);

        // Create Categories
        $categories = [
            ['name' => 'Groceries',    'icon' => '🛒', 'slug' => 'groceries'],
            ['name' => 'Clothing',     'icon' => '👗', 'slug' => 'clothing'],
            ['name' => 'Electronics',  'icon' => '📱', 'slug' => 'electronics'],
            ['name' => 'Handicrafts',  'icon' => '🏺', 'slug' => 'handicrafts'],
            ['name' => 'Food & Dining','icon' => '🍽️', 'slug' => 'food-dining'],
            ['name' => 'Furniture',    'icon' => '🛋️', 'slug' => 'furniture'],
            ['name' => 'Beauty',       'icon' => '💄', 'slug' => 'beauty'],
            ['name' => 'Books',        'icon' => '📚', 'slug' => 'books'],
        ];

        $categoryIds = [];
        foreach ($categories as $i => $cat) {
            $category = Category::create(array_merge($cat, ['sort_order' => $i + 1]));
            $categoryIds[$cat['slug']] = $category->id;
        }

        // Create Vendors with Users
        $vendorData = [
            [
                'user' => ['name' => 'Ramesh Kumar', 'email' => 'ramesh@vendor.com', 'city' => 'Mumbai'],
                'shop' => ['shop_name' => "Ramesh's Fresh Groceries", 'category' => 'Groceries', 'city' => 'Mumbai', 'shop_address' => 'Dharavi Market, Mumbai', 'description' => 'Fresh farm produce delivered daily'],
            ],
            [
                'user' => ['name' => 'Priya Sharma', 'email' => 'priya@vendor.com', 'city' => 'Delhi'],
                'shop' => ['shop_name' => 'Priya Fashion Hub', 'category' => 'Clothing', 'city' => 'Delhi', 'shop_address' => 'Lajpat Nagar, Delhi', 'description' => 'Traditional and modern Indian wear'],
            ],
            [
                'user' => ['name' => 'Ahmed Ali', 'email' => 'ahmed@vendor.com', 'city' => 'Hyderabad'],
                'shop' => ['shop_name' => 'Ali Electronics', 'category' => 'Electronics', 'city' => 'Hyderabad', 'shop_address' => 'Abids, Hyderabad', 'description' => 'Best electronic deals in the city'],
            ],
        ];

        $vendorIds = [];
        foreach ($vendorData as $data) {
            $user = User::create(array_merge($data['user'], [
                'password' => Hash::make('password123'),
                'role'     => 'vendor',
                'is_email_verified' => true,
                'is_active' => true,
            ]));

            $vendor = Vendor::create(array_merge($data['shop'], [
                'user_id'     => $user->id,
                'vendor_name' => $data['user']['name'],
                'phone'       => '+91-8' . rand(100000000, 999999999),
                'email'       => $data['user']['email'],
                'is_approved' => true,
                'is_active'   => true,
                'rating'      => round(rand(38, 50) / 10, 1),
            ]));

            $vendorIds[] = $vendor->id;
        }

        // Create Products
        $products = [
            ['title' => 'Organic Basmati Rice 5kg', 'price' => 299, 'category' => 'groceries', 'vendor' => 0, 'stock' => 100],
            ['title' => 'Fresh Tomatoes 1kg', 'price' => 45, 'category' => 'groceries', 'vendor' => 0, 'stock' => 200],
            ['title' => 'Handloom Cotton Saree', 'price' => 1299, 'category' => 'clothing', 'vendor' => 1, 'stock' => 25],
            ['title' => 'Men\'s Kurta Set', 'price' => 799, 'category' => 'clothing', 'vendor' => 1, 'stock' => 40],
            ['title' => 'Wireless Bluetooth Earbuds', 'price' => 1499, 'category' => 'electronics', 'vendor' => 2, 'stock' => 50],
            ['title' => 'Smart LED Bulb Set', 'price' => 599, 'category' => 'electronics', 'vendor' => 2, 'stock' => 80],
        ];

        foreach ($products as $p) {
            Product::create([
                'title'          => $p['title'],
                'description'    => "High quality {$p['title']} from local vendors. Fresh and authentic products.",
                'price'          => $p['price'],
                'original_price' => round($p['price'] * 1.2),
                'discount_percentage' => 20,
                'stock'          => $p['stock'],
                'vendor_id'      => $vendorIds[$p['vendor']],
                'category_id'    => $categoryIds[$p['category']],
                'images'         => ["https://picsum.photos/seed/{$p['title']}/400/400"],
                'tags'           => explode(' ', strtolower($p['title'])),
                'rating'         => round(rand(35, 50) / 10, 1),
                'total_reviews'  => rand(5, 120),
                'total_sold'     => rand(10, 500),
                'is_active'      => true,
                'is_approved'    => true,
                'is_featured'    => rand(0, 1) === 1,
                'city'           => ['Mumbai', 'Delhi', 'Hyderabad'][$p['vendor']],
            ]);
        }

        // Sample Coupons
        Coupon::create([
            'code'             => 'WELCOME10',
            'type'             => 'percentage',
            'value'            => 10,
            'min_order_amount' => 200,
            'max_discount'     => 100,
            'description'      => 'Welcome discount - 10% off on first order',
            'usage_limit'      => 1000,
            'is_active'        => true,
        ]);

        Coupon::create([
            'code'        => 'FLAT50',
            'type'        => 'fixed',
            'value'       => 50,
            'min_order_amount' => 300,
            'description' => 'Flat ₹50 off on orders above ₹300',
            'is_active'   => true,
        ]);

        $this->command->info('Database seeded successfully!');
        $this->command->info('Admin: admin@localmarket.com / password123');
        $this->command->info('Vendor: ramesh@vendor.com / password123');
    }
}
