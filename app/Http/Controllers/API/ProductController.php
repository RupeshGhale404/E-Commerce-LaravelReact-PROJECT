<?php

declare(strict_types=1);

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    /**
     * List all active products with pagination, optional category filter, and search.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'category_slug' => ['sometimes', 'string', 'exists:categories,slug'],
            'search' => ['sometimes', 'string', 'max:100'],
            'min_price' => ['sometimes', 'numeric', 'min:0'],
            'max_price' => ['sometimes', 'numeric', 'min:0'],
            'sort_by' => ['sometimes', 'in:price,name,created_at'],
            'sort_dir' => ['sometimes', 'in:asc,desc'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $query = Product::query()
            ->with('category')
            ->active();

        // Filter by category
        if ($request->filled('category_id')) {
            $query->byCategory((int) $request->input('category_id'));
        }

        if ($request->filled('category_slug')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->input('category_slug')));
        }

        // Full-text search
        if ($request->filled('search')) {
            $search = '%' . $request->input('search') . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', $search)
                    ->orWhere('description', 'LIKE', $search);
            });
        }

        // Price range filter
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->input('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->input('max_price'));
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $perPage = (int) $request->input('per_page', 15);
        $products = $query->paginate($perPage)->withQueryString();

        return ProductResource::collection($products);
    }

    /**
     * Show a single product by slug or ID.
     */
    public function show(string $slugOrId): JsonResponse
    {
        $product = is_numeric($slugOrId)
            ? Product::with('category')->active()->findOrFail($slugOrId)
            : Product::with('category')->active()->where('slug', $slugOrId)->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new ProductResource($product),
        ]);
    }
}