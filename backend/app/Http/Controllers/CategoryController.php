<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::where('is_active', true)
            ->whereNull('parent_id')
            ->with('children')
            ->orderBy('sort_order')
            ->get();

        return response()->json($categories);
    }

    public function show($id)
    {
        $category = Category::with('children')->find($id);

        if (!$category) {
            return response()->json(['error' => 'Category not found'], 404);
        }

        return response()->json($category);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:100|unique:categories',
            'description' => 'nullable|string',
            'icon'        => 'nullable|string',
            'image'       => 'nullable|string',
            'parent_id'   => 'nullable|string',
            'sort_order'  => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $category = Category::create([
            'name'       => $request->name,
            'slug'       => Str::slug($request->name),
            'description'=> $request->description,
            'icon'       => $request->icon,
            'image'      => $request->image,
            'parent_id'  => $request->parent_id,
            'sort_order' => $request->sort_order ?? 0,
        ]);

        return response()->json([
            'message'  => 'Category created',
            'category' => $category,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json(['error' => 'Category not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'       => 'sometimes|string|max:100',
            'is_active'  => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('name')) {
            $request->merge(['slug' => Str::slug($request->name)]);
        }

        $category->update($request->only(['name', 'slug', 'description', 'icon', 'image', 'is_active', 'sort_order']));

        return response()->json(['message' => 'Category updated', 'category' => $category->fresh()]);
    }

    public function destroy($id)
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json(['error' => 'Category not found'], 404);
        }

        $category->delete();

        return response()->json(['message' => 'Category deleted']);
    }
}
