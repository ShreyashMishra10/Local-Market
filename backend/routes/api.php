<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\NotificationController;

// ─── Public Routes ───────────────────────────────────────────────────────────
Route::prefix('auth')->middleware('throttle:10,1')->group(function () {
    Route::post('register',        [AuthController::class, 'register']);
    Route::post('login',           [AuthController::class, 'login']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
});

// Products - public
Route::prefix('products')->group(function () {
    Route::get('/',          [ProductController::class, 'index']);
    Route::get('/featured',  [ProductController::class, 'featured']);
    Route::get('/trending',  [ProductController::class, 'trending']);
    Route::get('/{id}',      [ProductController::class, 'show']);
    Route::get('/{id}/reviews', [ReviewController::class, 'index']);
});

// Vendors - public
Route::prefix('vendors')->group(function () {
    Route::get('/',         [VendorController::class, 'index']);
    Route::get('/featured', [VendorController::class, 'featured']);
    Route::get('/nearby',   [VendorController::class, 'nearby']);
    Route::get('/{id}',     [VendorController::class, 'show']);
});

// Categories - public
Route::prefix('categories')->group(function () {
    Route::get('/',      [CategoryController::class, 'index']);
    Route::get('/{id}',  [CategoryController::class, 'show']);
});

// Coupon validation - public
Route::post('coupons/validate', [CouponController::class, 'validate']);

// Stock notification (public endpoint)
Route::post('products/notify', [ProductController::class, 'notifyStock']);

// ─── Authenticated Routes ─────────────────────────────────────────────────────
Route::middleware('jwt.auth')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('logout',          [AuthController::class, 'logout']);
        Route::post('refresh',         [AuthController::class, 'refresh']);
        Route::get('me',               [AuthController::class, 'me']);
        Route::put('profile',          [AuthController::class, 'updateProfile']);
        Route::post('change-password', [AuthController::class, 'changePassword']);
    });

    // Cart
    Route::prefix('cart')->group(function () {
        Route::get('/',               [CartController::class, 'index']);
        Route::post('/add',           [CartController::class, 'addItem']);
        Route::put('/item/{id}',      [CartController::class, 'updateItem']);
        Route::delete('/item/{id}',   [CartController::class, 'removeItem']);
        Route::post('/coupon',        [CartController::class, 'applyCoupon']);
        Route::delete('/coupon',      [CartController::class, 'removeCoupon']);
        Route::delete('/clear',       [CartController::class, 'clear']);
    });

    // Wishlist
    Route::prefix('wishlist')->group(function () {
        Route::get('/',             [WishlistController::class, 'index']);
        Route::post('/add',         [WishlistController::class, 'add']);
        Route::delete('/{id}',      [WishlistController::class, 'remove']);
        Route::get('/check/{id}',   [WishlistController::class, 'check']);
    });

    // Orders (customer)
    Route::prefix('orders')->group(function () {
        Route::get('/',       [OrderController::class, 'index']);
        Route::post('/',      [OrderController::class, 'store']);
        Route::get('/{id}',   [OrderController::class, 'show']);
        Route::post('/{id}/cancel', [OrderController::class, 'cancel']);
    });

    // Reviews
    Route::post('reviews',       [ReviewController::class, 'store']);
    Route::put('reviews/{id}',   [ReviewController::class, 'update']);
    Route::delete('reviews/{id}',[ReviewController::class, 'destroy']);
    Route::post('reviews/{id}/helpful', [ReviewController::class, 'markHelpful']);

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/',            [NotificationController::class, 'index']);
        Route::put('/{id}/read',   [NotificationController::class, 'markRead']);
        Route::put('/read-all',    [NotificationController::class, 'markAllRead']);
        Route::delete('/{id}',     [NotificationController::class, 'destroy']);
    });

    // ─── Vendor Routes ────────────────────────────────────────────────────────
    Route::middleware('role.vendor')->prefix('vendor')->group(function () {
        // Vendor profile
        Route::get('profile',    [VendorController::class, 'profile']);
        Route::put('profile',    [VendorController::class, 'updateProfile']);
        Route::get('analytics',  [VendorController::class, 'analytics']);

        // Vendor products
        Route::get('products',              [ProductController::class, 'vendorProducts']);
        Route::post('products',             [ProductController::class, 'store']);
        Route::put('products/{id}',         [ProductController::class, 'update']);
        Route::delete('products/{id}',      [ProductController::class, 'destroy']);
        Route::patch('products/{id}/stock', [ProductController::class, 'updateStock']);

        // Vendor orders
        Route::get('orders',               [OrderController::class, 'vendorOrders']);
        Route::put('orders/{id}/status',   [OrderController::class, 'updateStatus']);

        // Vendor reviews
        Route::post('reviews/{id}/reply',  [ReviewController::class, 'vendorReply']);
    });

    // ─── Admin Routes ─────────────────────────────────────────────────────────
    Route::middleware('role.admin')->prefix('admin')->group(function () {
        Route::get('dashboard', [AdminController::class, 'dashboard']);

        // Users
        Route::get('users',         [AdminController::class, 'listUsers']);
        Route::put('users/{id}/ban',[AdminController::class, 'banUser']);
        Route::delete('users/{id}', [AdminController::class, 'deleteUser']);

        // Vendors
        Route::get('vendors',               [AdminController::class, 'listVendors']);
        Route::put('vendors/{id}/approve',  [AdminController::class, 'approveVendor']);
        Route::put('vendors/{id}/reject',   [AdminController::class, 'rejectVendor']);

        // Products
        Route::get('products',                  [AdminController::class, 'listProducts']);
        Route::put('products/{id}/approve',     [AdminController::class, 'approveProduct']);
        Route::put('products/{id}/reject',      [AdminController::class, 'rejectProduct']);
        Route::put('products/{id}/feature',     [AdminController::class, 'featureProduct']);

        // Orders
        Route::get('orders', [AdminController::class, 'listOrders']);

        // Categories (admin only)
        Route::post('categories',        [CategoryController::class, 'store']);
        Route::put('categories/{id}',    [CategoryController::class, 'update']);
        Route::delete('categories/{id}', [CategoryController::class, 'destroy']);

        // Coupons (admin only)
        Route::get('coupons',        [CouponController::class, 'index']);
        Route::post('coupons',       [CouponController::class, 'store']);
        Route::put('coupons/{id}',   [CouponController::class, 'update']);
        Route::delete('coupons/{id}',[CouponController::class, 'destroy']);

        // Reports
        Route::get('reports/sales',  [AdminController::class, 'salesReport']);
    });
});
