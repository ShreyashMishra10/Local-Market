<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Product;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class ReviewController extends Controller
{
    public function index(Request $request, $productId)
    {
        $reviews = Review::where('product_id', $productId)
            ->with('user:id,name,profile_picture')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $stats = [
            'average' => Review::where('product_id', $productId)->avg('rating') ?? 0,
            'total'   => Review::where('product_id', $productId)->count(),
            'breakdown' => [],
        ];

        for ($i = 5; $i >= 1; $i--) {
            $stats['breakdown'][$i] = Review::where('product_id', $productId)->where('rating', $i)->count();
        }

        return response()->json(['reviews' => $reviews, 'stats' => $stats]);
    }

    public function store(Request $request)
    {
        $user = JWTAuth::user();

        $validator = Validator::make($request->all(), [
            'product_id' => 'required|string',
            'rating'     => 'required|integer|between:1,5',
            'comment'    => 'required|string|min:10|max:1000',
            'images'     => 'nullable|array|max:3',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if already reviewed
        $existing = Review::where('user_id', $user->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($existing) {
            return response()->json(['error' => 'You have already reviewed this product'], 400);
        }

        // Verify purchase (optional but recommended)
        $hasPurchased = Order::where('customer_id', $user->id)
            ->where('status', 'delivered')
            ->whereRaw(['items' => ['$elemMatch' => ['product_id' => $request->product_id]]])
            ->exists();

        $review = Review::create([
            'user_id'    => $user->id,
            'product_id' => $request->product_id,
            'rating'     => $request->rating,
            'comment'    => $request->comment,
            'images'     => $request->images ?? [],
            'is_verified' => $hasPurchased,
        ]);

        // Update product rating
        $this->updateProductRating($request->product_id);

        return response()->json([
            'message' => 'Review submitted successfully',
            'review'  => $review->load('user:id,name,profile_picture'),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user   = JWTAuth::user();
        $review = Review::where('user_id', $user->id)->find($id);

        if (!$review) {
            return response()->json(['error' => 'Review not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'rating'  => 'sometimes|integer|between:1,5',
            'comment' => 'sometimes|string|min:10|max:1000',
            'images'  => 'nullable|array|max:3',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $review->update($request->only(['rating', 'comment', 'images']));
        $this->updateProductRating($review->product_id);

        return response()->json([
            'message' => 'Review updated',
            'review'  => $review->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $user   = JWTAuth::user();
        $review = Review::where('user_id', $user->id)->find($id);

        if (!$review) {
            return response()->json(['error' => 'Review not found'], 404);
        }

        $productId = $review->product_id;
        $review->delete();
        $this->updateProductRating($productId);

        return response()->json(['message' => 'Review deleted']);
    }

    public function markHelpful($id)
    {
        $review = Review::find($id);
        if (!$review) {
            return response()->json(['error' => 'Review not found'], 404);
        }
        $review->increment('helpful_count');
        return response()->json(['helpful_count' => $review->helpful_count + 1]);
    }

    public function vendorReply(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'reply' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $review = Review::find($id);
        if (!$review) {
            return response()->json(['error' => 'Review not found'], 404);
        }

        $review->update(['reply' => $request->reply, 'reply_at' => now()]);

        return response()->json(['message' => 'Reply added', 'review' => $review->fresh()]);
    }

    private function updateProductRating(string $productId): void
    {
        $avg   = Review::where('product_id', $productId)->avg('rating') ?? 0;
        $count = Review::where('product_id', $productId)->count();

        Product::find($productId)?->update([
            'rating'        => round($avg, 1),
            'total_reviews' => $count,
        ]);
    }
}
