<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class VendorController extends Controller
{
    public function index(Request $request)
    {
        $query = Vendor::with('user:id,name,email')
            ->where('is_approved', true)
            ->where('is_active', true);

        if ($request->city) {
            $query->where('city', $request->city);
        }

        if ($request->category) {
            $query->where('category', $request->category);
        }

        if ($request->search) {
            $query->where('shop_name', 'like', "%{$request->search}%");
        }

        $vendors = $query->orderBy('rating', 'desc')->paginate(12);

        return response()->json($vendors);
    }

    public function show($id)
    {
        $vendor = Vendor::with('user:id,name,email')
            ->where('is_approved', true)
            ->find($id);

        if (!$vendor) {
            return response()->json(['error' => 'Vendor not found'], 404);
        }

        $products = Product::where('vendor_id', $id)
            ->where('is_active', true)
            ->where('is_approved', true)
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return response()->json([
            'vendor'   => $vendor,
            'products' => $products,
        ]);
    }

    public function profile(Request $request)
    {
        $user   = JWTAuth::user();
        $vendor = Vendor::where('user_id', $user->id)->first();

        if (!$vendor) {
            return response()->json(['error' => 'Vendor not found'], 404);
        }

        return response()->json($vendor);
    }

    public function updateProfile(Request $request)
    {
        $user   = JWTAuth::user();
        $vendor = Vendor::where('user_id', $user->id)->first();

        if (!$vendor) {
            return response()->json(['error' => 'Vendor not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'shop_name'    => 'sometimes|string|max:255',
            'description'  => 'sometimes|string',
            'shop_address' => 'sometimes|string',
            'city'         => 'sometimes|string',
            'phone'        => 'sometimes|string',
            'category'     => 'sometimes|string',
            'tags'         => 'nullable|array',
            'social_links' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $vendor->update($request->only([
            'shop_name', 'description', 'shop_address', 'city',
            'phone', 'category', 'tags', 'social_links',
            'shop_logo', 'banner_image',
        ]));

        return response()->json([
            'message' => 'Vendor profile updated',
            'vendor'  => $vendor->fresh(),
        ]);
    }

    public function analytics(Request $request)
    {
        $user   = JWTAuth::user();
        $vendor = Vendor::where('user_id', $user->id)->first();

        if (!$vendor) {
            return response()->json(['error' => 'Vendor not found'], 404);
        }

        $totalOrders     = Order::where('vendor_id', $vendor->id)->count();
        $totalRevenue    = Order::where('vendor_id', $vendor->id)
                            ->where('status', 'delivered')
                            ->sum('total');
        $pendingOrders   = Order::where('vendor_id', $vendor->id)->where('status', 'pending')->count();
        $totalProducts   = Product::where('vendor_id', $vendor->id)->count();
        $activeProducts  = Product::where('vendor_id', $vendor->id)->where('is_active', true)->count();

        // Monthly sales for chart (last 6 months)
        $monthlySales = [];
        for ($i = 5; $i >= 0; $i--) {
            $date  = now()->subMonths($i);
            $month = $date->format('M Y');
            $sales = Order::where('vendor_id', $vendor->id)
                ->where('status', 'delivered')
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('total');
            $monthlySales[] = ['month' => $month, 'sales' => $sales];
        }

        // Best selling products
        $bestSellers = Product::where('vendor_id', $vendor->id)
            ->orderBy('total_sold', 'desc')
            ->limit(5)
            ->get(['_id', 'title', 'price', 'total_sold', 'images', 'stock']);

        // Recent orders
        $recentOrders = Order::where('vendor_id', $vendor->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'overview' => [
                'total_orders'    => $totalOrders,
                'total_revenue'   => $totalRevenue,
                'pending_orders'  => $pendingOrders,
                'total_products'  => $totalProducts,
                'active_products' => $activeProducts,
                'rating'          => $vendor->rating,
                'total_reviews'   => $vendor->total_reviews,
            ],
            'monthly_sales' => $monthlySales,
            'best_sellers'  => $bestSellers,
            'recent_orders' => $recentOrders,
        ]);
    }

    public function nearby(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'city' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $vendors = Vendor::where('city', 'like', "%{$request->city}%")
            ->where('is_approved', true)
            ->where('is_active', true)
            ->orderBy('rating', 'desc')
            ->limit(10)
            ->get();

        return response()->json($vendors);
    }

    public function featured()
    {
        $vendors = Vendor::where('is_approved', true)
            ->where('is_active', true)
            ->orderBy('rating', 'desc')
            ->limit(8)
            ->get();

        return response()->json($vendors);
    }
}
