<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CouponController extends Controller
{
    public function index()
    {
        return response()->json(Coupon::orderBy('created_at', 'desc')->paginate(20));
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code'             => 'required|string|unique:coupons|max:20',
            'type'             => 'required|in:percentage,fixed',
            'value'            => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_discount'     => 'nullable|numeric|min:0',
            'usage_limit'      => 'nullable|integer|min:1',
            'expires_at'       => 'nullable|date',
            'description'      => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $coupon = Coupon::create([
            'code'             => strtoupper($request->code),
            'type'             => $request->type,
            'value'            => $request->value,
            'min_order_amount' => $request->min_order_amount,
            'max_discount'     => $request->max_discount,
            'usage_limit'      => $request->usage_limit,
            'expires_at'       => $request->expires_at,
            'description'      => $request->description,
            'vendor_id'        => $request->vendor_id,
        ]);

        return response()->json(['message' => 'Coupon created', 'coupon' => $coupon], 201);
    }

    public function update(Request $request, $id)
    {
        $coupon = Coupon::find($id);

        if (!$coupon) {
            return response()->json(['error' => 'Coupon not found'], 404);
        }

        $coupon->update($request->only(['value', 'min_order_amount', 'max_discount', 'usage_limit', 'expires_at', 'is_active', 'description']));

        return response()->json(['message' => 'Coupon updated', 'coupon' => $coupon->fresh()]);
    }

    public function destroy($id)
    {
        Coupon::find($id)?->delete();
        return response()->json(['message' => 'Coupon deleted']);
    }

    public function validate(Request $request)
    {
        $request->validate(['code' => 'required|string', 'amount' => 'required|numeric']);

        $coupon = Coupon::where('code', strtoupper($request->code))->first();

        if (!$coupon || !$coupon->isValid()) {
            return response()->json(['error' => 'Invalid or expired coupon'], 400);
        }

        $discount = $coupon->calculateDiscount($request->amount);

        if ($discount === 0) {
            return response()->json(['error' => "Minimum order amount is ₹{$coupon->min_order_amount}"], 400);
        }

        return response()->json([
            'valid'       => true,
            'discount'    => $discount,
            'description' => $coupon->description,
            'type'        => $coupon->type,
            'value'       => $coupon->value,
        ]);
    }
}
