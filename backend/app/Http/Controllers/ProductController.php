<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['vendor:id,shop_name,shop_logo,city,rating', 'category:id,name,slug'])
            ->where('is_active', true)
            ->where('is_approved', true);

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('tags', 'like', "%{$search}%");
            });
        }

        if ($request->category) {
            $query->where('category_id', $request->category);
        }

        if ($request->vendor) {
            $query->where('vendor_id', $request->vendor);
        }

        if ($request->city) {
            $query->where('city', $request->city);
        }

        if ($request->min_price) {
            $query->where('price', '>=', (float) $request->min_price);
        }

        if ($request->max_price) {
            $query->where('price', '<=', (float) $request->max_price);
        }

        if ($request->min_rating) {
            $query->where('rating', '>=', (float) $request->min_rating);
        }

        if ($request->featured) {
            $query->where('is_featured', true);
        }

        $sortField = match($request->sort) {
            'price_asc'  => ['price', 'asc'],
            'price_desc' => ['price', 'desc'],
            'rating'     => ['rating', 'desc'],
            'newest'     => ['created_at', 'desc'],
            'popular'    => ['total_sold', 'desc'],
            default      => ['created_at', 'desc'],
        };

        $query->orderBy($sortField[0], $sortField[1]);

        $perPage = min((int)($request->per_page ?? 12), 50);
        $products = $query->paginate($perPage);

        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::with([
            'vendor:id,shop_name,shop_logo,city,rating,description,phone',
            'category:id,name,slug',
            'reviews' => fn($q) => $q->with('user:id,name,profile_picture')->latest()->limit(10),
        ])->where('is_active', true)->where('is_approved', true)->find($id);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $similar = Product::where('category_id', $product->category_id)
            ->where('_id', '!=', $id)
            ->where('is_active', true)
            ->where('is_approved', true)
            ->limit(8)
            ->get(['_id', 'title', 'price', 'images', 'rating', 'vendor_id']);

        return response()->json([
            'product' => $product,
            'similar' => $similar,
        ]);
    }

    public function store(Request $request)
    {
        $user = JWTAuth::user();
        $vendor = Vendor::where('user_id', $user->id)->first();

        if (!$vendor) {
            return response()->json(['error' => 'Vendor profile not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'category_id' => 'required|string',
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'images'      => 'nullable|array',
            'tags'        => 'nullable|array',
            'sku'         => 'nullable|string',
            'specifications' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $originalPrice = $request->original_price ?? $request->price;
        $discount = $originalPrice > $request->price
            ? round((($originalPrice - $request->price) / $originalPrice) * 100, 2)
            : 0;

        $product = Product::create([
            'vendor_id'            => $vendor->id,
            'category_id'          => $request->category_id,
            'title'                => $request->title,
            'description'          => $request->description,
            'price'                => $request->price,
            'original_price'       => $originalPrice,
            'discount_percentage'  => $discount,
            'stock'                => $request->stock,
            'images'               => $request->images ?? [],
            'tags'                 => $request->tags ?? [],
            'sku'                  => $request->sku,
            'specifications'       => $request->specifications ?? [],
            'city'                 => $vendor->city,
            'is_active'            => true,
            'is_approved'          => false,
        ]);

        return response()->json([
            'message' => 'Product created and pending approval',
            'product' => $product,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = JWTAuth::user();
        $vendor = Vendor::where('user_id', $user->id)->first();

        $product = Product::where('vendor_id', $vendor?->id)->find($id);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title'       => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price'       => 'sometimes|numeric|min:0',
            'stock'       => 'sometimes|integer|min:0',
            'images'      => 'nullable|array',
            'tags'        => 'nullable|array',
            'is_active'   => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product->update($request->only([
            'title', 'description', 'price', 'original_price', 'stock',
            'images', 'tags', 'sku', 'specifications', 'category_id', 'is_active',
        ]));

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $user = JWTAuth::user();
        $vendor = Vendor::where('user_id', $user->id)->first();

        $product = Product::where('vendor_id', $vendor?->id)->find($id);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }

    public function vendorProducts(Request $request)
    {
        $user = JWTAuth::user();
        $vendor = Vendor::where('user_id', $user->id)->first();

        if (!$vendor) {
            return response()->json(['error' => 'Vendor not found'], 404);
        }

        $products = Product::where('vendor_id', $vendor->id)
            ->with('category:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($products);
    }

    public function updateStock(Request $request, $id)
    {
        $user = JWTAuth::user();
        $vendor = Vendor::where('user_id', $user->id)->first();

        $product = Product::where('vendor_id', $vendor?->id)->find($id);

        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'stock' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product->update(['stock' => $request->stock]);

        return response()->json(['message' => 'Stock updated', 'stock' => $request->stock]);
    }

    public function featured()
    {
        $products = Product::with('vendor:id,shop_name,shop_logo')
            ->where('is_featured', true)
            ->where('is_active', true)
            ->where('is_approved', true)
            ->orderBy('total_sold', 'desc')
            ->limit(12)
            ->get();

        return response()->json($products);
    }

    public function trending()
    {
        $products = Product::with('vendor:id,shop_name,shop_logo')
            ->where('is_active', true)
            ->where('is_approved', true)
            ->orderBy('total_sold', 'desc')
            ->limit(12)
            ->get();

        return response()->json($products);
    }
}
