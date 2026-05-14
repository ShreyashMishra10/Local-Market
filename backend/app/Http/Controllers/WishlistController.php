<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Product;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class WishlistController extends Controller
{
    public function index()
    {
        $user     = JWTAuth::user();
        $wishlist = $user->wishlist ?? [];

        $products = Product::whereIn('_id', $wishlist)
            ->where('is_active', true)
            ->with('vendor:id,shop_name')
            ->get();

        return response()->json($products);
    }

    public function add(Request $request)
    {
        $request->validate(['product_id' => 'required|string']);

        $user     = JWTAuth::user();
        $wishlist = $user->wishlist ?? [];

        if (!in_array($request->product_id, $wishlist)) {
            $wishlist[] = $request->product_id;
            $user->update(['wishlist' => $wishlist]);
        }

        return response()->json(['message' => 'Added to wishlist', 'wishlist' => $wishlist]);
    }

    public function remove($productId)
    {
        $user     = JWTAuth::user();
        $wishlist = array_filter($user->wishlist ?? [], fn($id) => $id !== $productId);
        $user->update(['wishlist' => array_values($wishlist)]);

        return response()->json(['message' => 'Removed from wishlist']);
    }

    public function check($productId)
    {
        $user = JWTAuth::user();
        $isInWishlist = in_array($productId, $user->wishlist ?? []);

        return response()->json(['in_wishlist' => $isInWishlist]);
    }
}
