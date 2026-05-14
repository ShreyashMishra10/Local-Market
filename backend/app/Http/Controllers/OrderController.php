<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = JWTAuth::user();

        $orders = Order::where('customer_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($orders);
    }

    public function show($id)
    {
        $user = JWTAuth::user();

        $order = Order::where('customer_id', $user->id)->find($id);

        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        return response()->json($order);
    }

    public function store(Request $request)
    {
        $user = JWTAuth::user();

        $validator = Validator::make($request->all(), [
            'items'            => 'required|array|min:1',
            'items.*.product_id' => 'required|string',
            'items.*.quantity'   => 'required|integer|min:1',
            'shipping_address' => 'required|array',
            'shipping_address.name'    => 'required|string',
            'shipping_address.phone'   => 'required|string',
            'shipping_address.address' => 'required|string',
            'shipping_address.city'    => 'required|string',
            'payment_method'   => 'required|in:cod,stripe,razorpay',
            'coupon_code'      => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $orderItems = [];
        $subtotal   = 0;
        $vendorId   = null;

        foreach ($request->items as $item) {
            $product = Product::find($item['product_id']);

            if (!$product || !$product->is_active || !$product->is_approved) {
                return response()->json(['error' => "Product {$item['product_id']} is unavailable"], 400);
            }

            if ($product->stock < $item['quantity']) {
                return response()->json(['error' => "Insufficient stock for {$product->title}"], 400);
            }

            $vendorId = $product->vendor_id;
            $lineTotal = $product->price * $item['quantity'];
            $subtotal += $lineTotal;

            $orderItems[] = [
                'product_id'   => $product->id,
                'title'        => $product->title,
                'price'        => $product->price,
                'quantity'     => $item['quantity'],
                'total'        => $lineTotal,
                'image'        => $product->images[0] ?? null,
                'vendor_id'    => $product->vendor_id,
            ];

            $product->decrement('stock', $item['quantity']);
            $product->increment('total_sold', $item['quantity']);
        }

        $discount    = 0;
        $couponCode  = null;

        if ($request->coupon_code) {
            $coupon = Coupon::where('code', $request->coupon_code)->first();
            if ($coupon && $coupon->isValid()) {
                $discount   = $coupon->calculateDiscount($subtotal);
                $couponCode = $request->coupon_code;
                $coupon->increment('used_count');
            }
        }

        $shippingFee = $subtotal >= 500 ? 0 : 50;
        $total = $subtotal - $discount + $shippingFee;

        $order = Order::create([
            'customer_id'      => $user->id,
            'vendor_id'        => $vendorId,
            'items'            => $orderItems,
            'subtotal'         => $subtotal,
            'discount'         => $discount,
            'shipping_fee'     => $shippingFee,
            'total'            => $total,
            'status'           => 'pending',
            'payment_status'   => $request->payment_method === 'cod' ? 'pending' : 'paid',
            'payment_method'   => $request->payment_method,
            'shipping_address' => $request->shipping_address,
            'coupon_code'      => $couponCode,
            'notes'            => $request->notes,
            'status_history'   => [
                ['status' => 'pending', 'timestamp' => now()->toIso8601String(), 'note' => 'Order placed'],
            ],
        ]);

        // Clear cart
        Cart::where('user_id', $user->id)->delete();

        // Update vendor total_sales
        if ($vendorId) {
            Vendor::find($vendorId)?->increment('total_sales', $total);
        }

        return response()->json([
            'message'      => 'Order placed successfully',
            'order'        => $order,
            'order_number' => $order->order_number,
        ], 201);
    }

    public function cancel(Request $request, $id)
    {
        $user  = JWTAuth::user();
        $order = Order::where('customer_id', $user->id)->find($id);

        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return response()->json(['error' => 'Order cannot be cancelled at this stage'], 400);
        }

        $history = $order->status_history ?? [];
        $history[] = [
            'status'    => 'cancelled',
            'timestamp' => now()->toIso8601String(),
            'note'      => $request->reason ?? 'Cancelled by customer',
        ];

        $order->update([
            'status'            => 'cancelled',
            'cancelled_reason'  => $request->reason,
            'status_history'    => $history,
        ]);

        // Restore stock
        foreach ($order->items as $item) {
            Product::find($item['product_id'])?->increment('stock', $item['quantity']);
        }

        return response()->json(['message' => 'Order cancelled successfully']);
    }

    // Vendor: view incoming orders
    public function vendorOrders(Request $request)
    {
        $user   = JWTAuth::user();
        $vendor = Vendor::where('user_id', $user->id)->first();

        if (!$vendor) {
            return response()->json(['error' => 'Vendor not found'], 404);
        }

        $query = Order::where('vendor_id', $vendor->id)->orderBy('created_at', 'desc');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $orders = $query->paginate(15);

        return response()->json($orders);
    }

    // Vendor: update order status
    public function updateStatus(Request $request, $id)
    {
        $user   = JWTAuth::user();
        $vendor = Vendor::where('user_id', $user->id)->first();

        $order = Order::where('vendor_id', $vendor?->id)->find($id);

        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:confirmed,shipped,delivered,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $history   = $order->status_history ?? [];
        $history[] = [
            'status'    => $request->status,
            'timestamp' => now()->toIso8601String(),
            'note'      => $request->note ?? ucfirst($request->status),
        ];

        $order->update([
            'status'         => $request->status,
            'status_history' => $history,
            'tracking_number' => $request->tracking_number ?? $order->tracking_number,
        ]);

        return response()->json([
            'message' => 'Order status updated',
            'order'   => $order->fresh(),
        ]);
    }
}
