<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Vendor;
use App\Models\Product;
use App\Models\Order;
use App\Models\Review;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    public function dashboard()
    {
        $totalUsers    = User::where('role', 'customer')->count();
        $totalVendors  = Vendor::count();
        $totalProducts = Product::count();
        $totalOrders   = Order::count();
        $totalRevenue  = Order::where('status', 'delivered')->sum('total');
        $pendingVendors = Vendor::where('is_approved', false)->count();
        $pendingProducts = Product::where('is_approved', false)->count();

        $recentOrders = Order::with([])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Monthly revenue (last 6 months)
        $monthlyRevenue = [];
        for ($i = 5; $i >= 0; $i--) {
            $date  = now()->subMonths($i);
            $revenue = Order::where('status', 'delivered')
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('total');
            $monthlyRevenue[] = ['month' => $date->format('M Y'), 'revenue' => $revenue];
        }

        // Top vendors by sales
        $topVendors = Vendor::orderBy('total_sales', 'desc')->limit(5)->get(['shop_name', 'total_sales', 'rating']);

        return response()->json([
            'stats' => [
                'total_users'       => $totalUsers,
                'total_vendors'     => $totalVendors,
                'total_products'    => $totalProducts,
                'total_orders'      => $totalOrders,
                'total_revenue'     => $totalRevenue,
                'pending_vendors'   => $pendingVendors,
                'pending_products'  => $pendingProducts,
            ],
            'monthly_revenue' => $monthlyRevenue,
            'top_vendors'     => $topVendors,
            'recent_orders'   => $recentOrders,
        ]);
    }

    // User Management
    public function listUsers(Request $request)
    {
        $query = User::query();

        if ($request->role) {
            $query->where('role', $request->role);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate(20));
    }

    public function banUser(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $user->update(['is_active' => !$user->is_active]);

        $action = $user->is_active ? 'unbanned' : 'banned';
        return response()->json(['message' => "User {$action} successfully", 'is_active' => $user->is_active]);
    }

    public function deleteUser($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted']);
    }

    // Vendor Management
    public function listVendors(Request $request)
    {
        $query = Vendor::with('user:id,name,email');

        if ($request->approved !== null) {
            $query->where('is_approved', (bool) $request->approved);
        }

        if ($request->search) {
            $query->where('shop_name', 'like', "%{$request->search}%");
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate(20));
    }

    public function approveVendor($id)
    {
        $vendor = Vendor::find($id);

        if (!$vendor) {
            return response()->json(['error' => 'Vendor not found'], 404);
        }

        $vendor->update(['is_approved' => true]);

        return response()->json(['message' => 'Vendor approved successfully', 'vendor' => $vendor->fresh()]);
    }

    public function rejectVendor(Request $request, $id)
    {
        $vendor = Vendor::find($id);

        if (!$vendor) {
            return response()->json(['error' => 'Vendor not found'], 404);
        }

        $vendor->update(['is_approved' => false, 'is_active' => false]);

        return response()->json(['message' => 'Vendor rejected']);
    }

    // Product Moderation
    public function listProducts(Request $request)
    {
        $query = Product::with('vendor:id,shop_name');

        if ($request->approved !== null) {
            $query->where('is_approved', (bool) $request->approved);
        }

        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate(20));
    }

    public function approveProduct($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $product->update(['is_approved' => true]);

        return response()->json(['message' => 'Product approved']);
    }

    public function rejectProduct($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $product->update(['is_approved' => false, 'is_active' => false]);

        return response()->json(['message' => 'Product rejected/removed']);
    }

    public function featureProduct(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $product->update(['is_featured' => !$product->is_featured]);

        return response()->json(['message' => 'Product feature status toggled', 'is_featured' => $product->is_featured]);
    }

    // Analytics
    public function salesReport(Request $request)
    {
        $period  = $request->period ?? 'monthly';
        $results = [];

        if ($period === 'daily') {
            for ($i = 29; $i >= 0; $i--) {
                $date = now()->subDays($i);
                $results[] = [
                    'date'    => $date->format('M d'),
                    'orders'  => Order::whereDate('created_at', $date)->count(),
                    'revenue' => Order::where('status', 'delivered')->whereDate('created_at', $date)->sum('total'),
                ];
            }
        } else {
            for ($i = 11; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $results[] = [
                    'month'   => $date->format('M Y'),
                    'orders'  => Order::whereYear('created_at', $date->year)->whereMonth('created_at', $date->month)->count(),
                    'revenue' => Order::where('status', 'delivered')->whereYear('created_at', $date->year)->whereMonth('created_at', $date->month)->sum('total'),
                ];
            }
        }

        return response()->json($results);
    }

    public function listOrders(Request $request)
    {
        $query = Order::orderBy('created_at', 'desc');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(20));
    }
}
