<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class CartController extends Controller
{
    public function index()
    {
        $user = JWTAuth::user();
        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart) {
            return response()->json(['items' => [], 'subtotal' => 0, 'total' => 0, 'discount' => 0]);
        }

        $enrichedItems = [];
        foreach ($cart->items as $item) {
            $product = Product::find($item['product_id']);
            if ($product && $product->is_active) {
                $enrichedItems[] = array_merge($item, [
                    'current_price' => $product->price,
                    'stock'         => $product->stock,
                    'title'         => $product->title,
                    'images'        => $product->images,
                    'available'     => $product->stock >= $item['quantity'],
                ]);
            }
        }

        return response()->json([
            'items'       => $enrichedItems,
            'subtotal'    => $cart->subtotal,
            'discount'    => $cart->discount,
            'total'       => $cart->total,
            'item_count'  => $cart->item_count,
            'coupon_code' => $cart->coupon_code,
        ]);
    }

    public function addItem(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|string',
            'quantity'   => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user    = JWTAuth::user();
        $product = Product::find($request->product_id);

        if (!$product || !$product->is_active || !$product->is_approved) {
            return response()->json(['error' => 'Product not available'], 404);
        }

        if ($product->stock < $request->quantity) {
            return response()->json(['error' => 'Insufficient stock'], 400);
        }

        $cart = Cart::firstOrCreate(
            ['user_id' => $user->id],
            ['items' => [], 'discount' => 0]
        );

        $items = $cart->items ?? [];
        $found = false;

        foreach ($items as &$item) {
            if ($item['product_id'] === $request->product_id) {
                $newQty = $item['quantity'] + $request->quantity;
                if ($product->stock < $newQty) {
                    return response()->json(['error' => 'Insufficient stock'], 400);
                }
                $item['quantity'] = $newQty;
                $item['total']    = $product->price * $newQty;
                $found = true;
                break;
            }
        }

        if (!$found) {
            $items[] = [
                'product_id' => $product->id,
                'title'      => $product->title,
                'price'      => $product->price,
                'quantity'   => $request->quantity,
                'total'      => $product->price * $request->quantity,
                'image'      => $product->images[0] ?? null,
                'vendor_id'  => $product->vendor_id,
            ];
        }

        $cart->update(['items' => $items]);

        return response()->json([
            'message'    => 'Item added to cart',
            'item_count' => count($items),
        ]);
    }

    public function updateItem(Request $request, $productId)
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = JWTAuth::user();
        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart) {
            return response()->json(['error' => 'Cart not found'], 404);
        }

        $product = Product::find($productId);
        if ($product && $product->stock < $request->quantity) {
            return response()->json(['error' => 'Insufficient stock'], 400);
        }

        $items = collect($cart->items)->map(function ($item) use ($productId, $request, $product) {
            if ($item['product_id'] === $productId) {
                $item['quantity'] = $request->quantity;
                $item['total']    = ($product->price ?? $item['price']) * $request->quantity;
            }
            return $item;
        })->values()->toArray();

        $cart->update(['items' => $items]);

        return response()->json(['message' => 'Cart updated', 'subtotal' => $cart->subtotal]);
    }

    public function removeItem($productId)
    {
        $user = JWTAuth::user();
        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart) {
            return response()->json(['error' => 'Cart not found'], 404);
        }

        $items = collect($cart->items)->filter(fn($item) => $item['product_id'] !== $productId)->values()->toArray();
        $cart->update(['items' => $items]);

        return response()->json(['message' => 'Item removed from cart']);
    }

    public function applyCoupon(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user   = JWTAuth::user();
        $cart   = Cart::where('user_id', $user->id)->first();

        if (!$cart || empty($cart->items)) {
            return response()->json(['error' => 'Cart is empty'], 400);
        }

        $coupon = Coupon::where('code', strtoupper($request->code))->first();

        if (!$coupon || !$coupon->isValid()) {
            return response()->json(['error' => 'Invalid or expired coupon'], 400);
        }

        $discount = $coupon->calculateDiscount($cart->subtotal);

        if ($discount === 0) {
            return response()->json(['error' => "Minimum order amount is ₹{$coupon->min_order_amount}"], 400);
        }

        $cart->update([
            'coupon_code' => $request->code,
            'discount'    => $discount,
        ]);

        return response()->json([
            'message'  => 'Coupon applied successfully',
            'discount' => $discount,
            'total'    => $cart->total,
        ]);
    }

    public function removeCoupon()
    {
        $user = JWTAuth::user();
        $cart = Cart::where('user_id', $user->id)->first();

        if ($cart) {
            $cart->update(['coupon_code' => null, 'discount' => 0]);
        }

        return response()->json(['message' => 'Coupon removed']);
    }

    public function clear()
    {
        $user = JWTAuth::user();
        Cart::where('user_id', $user->id)->delete();

        return response()->json(['message' => 'Cart cleared']);
    }
}
