<?php

declare(strict_types=1);

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\PlaceOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class OrderController extends Controller
{
    /**
     * Get authenticated user's order history.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $orders = $request->user()
            ->orders()
            ->with(['items.product'])
            ->withCount('items')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return OrderResource::collection($orders);
    }

    /**
     * Show a specific order (must belong to authenticated user).
     */
    public function show(Request $request, Order $order): JsonResponse
    {
        // Ensure the order belongs to the authenticated user
        if ($order->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        $order->load(['items.product.category']);

        return response()->json([
            'success' => true,
            'data' => new OrderResource($order),
        ]);
    }

    /**
     * Place a new order with stock validation and atomic decrement.
     */
    public function store(PlaceOrderRequest $request): JsonResponse
    {
        $items = $request->validated('items');
        $productIds = array_column($items, 'product_id');

        try {
            $result = DB::transaction(function () use ($request, $items, $productIds) {
                // Lock products for update to prevent race conditions
                $products = Product::whereIn('id', $productIds)
                    ->active()
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                // Validate all products exist and are in stock
                $stockErrors = [];
                $orderItemsData = [];
                $totalAmount = 0.0;

                foreach ($items as $item) {
                    $productId = $item['product_id'];
                    $quantity = $item['quantity'];

                    if (! isset($products[$productId])) {
                        $stockErrors[] = "Product ID {$productId} is not available.";
                        continue;
                    }

                    $product = $products[$productId];

                    if (! $product->isInStock($quantity)) {
                        $stockErrors[] = "'{$product->name}' only has {$product->stock_quantity} units in stock (requested {$quantity}).";
                        continue;
                    }

                    $orderItemsData[] = [
                        'product_id' => $productId,
                        'quantity' => $quantity,
                        'price' => $product->price, // price snapshot at purchase time
                    ];

                    $totalAmount += (float) $product->price * $quantity;
                }

                if (! empty($stockErrors)) {
                    return ['errors' => $stockErrors];
                }

                // Create the order
                $order = Order::create([
                    'user_id' => $request->user()->id,
                    'total_amount' => $totalAmount,
                    'status' => 'pending',
                    'shipping_address' => $request->validated('shipping_address'),
                    'notes' => $request->validated('notes'),
                ]);

                // Create order items and decrement stock
                foreach ($orderItemsData as $itemData) {
                    $order->items()->create($itemData);
                    $products[$itemData['product_id']]->decrementStock($itemData['quantity']);
                }

                $order->load(['items.product.category']);

                return ['order' => $order];
            });

            if (isset($result['errors'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stock availability issue.',
                    'errors' => $result['errors'],
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully.',
                'data' => new OrderResource($result['order']),
            ], Response::HTTP_CREATED);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to place order. Please try again.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}