<?php

declare(strict_types=1);

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::withCount('products')->get();

        return response()->json([
            'success' => true,
            'data' => CategoryResource::collection($categories),
        ]);
    }

    public function show(Category $category): JsonResponse
    {
        $category->loadCount('products');

        return response()->json([
            'success' => true,
            'data' => new CategoryResource($category),
        ]);
    }
}