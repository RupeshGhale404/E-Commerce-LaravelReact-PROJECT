<?php

declare(strict_types=1);

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AdminController extends Controller
{
    // ─── Product Management ───────────────────────────────────────────

    /**
     * List all products (including inactive) for admin view.
     */
    public function products(Request $request): AnonymousResourceCollection
    {
        $products = Product::with('category')
            ->withTrashed()
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return ProductResource::collection($products);
    }

    /**
     * Create a new product.
     */
    public function storeProduct(StoreProductRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = Str::slug($data['name']);

        // Ensure slug is unique
        $originalSlug = $data['slug'];
        $count = 1;
        while (Product::withTrashed()->where('slug', $data['slug'])->exists()) {
            $data['slug'] = $originalSlug . '-' . $count++;
        }

        $product = Product::create($data);
        $product->load('category');

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully.',
            'data' => new ProductResource($product),
        ], Response::HTTP_CREATED);
    }

    /**
     * Update an existing product.
     */
    public function updateProduct(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $data = $request->validated();

        if (isset($data['name']) && ! isset($data['slug'])) {
            $newSlug = Str::slug($data['name']);
            if ($newSlug !== $product->slug) {
                $originalSlug = $newSlug;
                $count = 1;
                while (Product::withTrashed()->where('slug', $newSlug)->where('id', '!=', $product->id)->exists()) {
                    $newSlug = $originalSlug . '-' . $count++;
                }
                $data['slug'] = $newSlug;
            }
        }

        $product->update($data);
        $product->load('category');

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully.',
            'data' => new ProductResource($product),
        ]);
    }

    /**
     * Soft delete a product.
     */
    public function destroyProduct(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully.',
        ]);
    }

    // ─── Order Management ────────────────────────────────────────────

    /**
     * List all orders with filtering.
     */
    public function orders(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'status' => ['sometimes', 'in:pending,processing,completed,cancelled'],
        ]);

        $orders = Order::with(['user', 'items.product'])
            ->withCount('items')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return OrderResource::collection($orders);
    }

    /**
     * Update an order's status.
     */
    public function updateOrderStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,processing,completed,cancelled'],
        ]);

        $order->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully.',
            'data' => new OrderResource($order->load(['user', 'items.product'])),
        ]);
    }

    // ─── Category Management ─────────────────────────────────────────

    public function categories(): AnonymousResourceCollection
    {
        $categories = Category::withCount('products')->get();

        return \App\Http\Resources\CategoryResource::collection($categories);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $category = Category::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully.',
            'data' => new \App\Http\Resources\CategoryResource($category),
        ], Response::HTTP_CREATED);
    }

    // ─── Dashboard Stats ─────────────────────────────────────────────

    public function stats(): JsonResponse
    {
        $stats = [
            'total_products' => Product::count(),
            'total_orders' => Order::count(),
            'orders_by_status' => Order::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
            'total_revenue' => (float) Order::where('status', 'completed')->sum('total_amount'),
            'low_stock_products' => Product::active()->where('stock_quantity', '<=', 5)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}