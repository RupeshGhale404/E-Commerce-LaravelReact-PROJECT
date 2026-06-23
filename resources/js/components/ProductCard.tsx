import React from 'react';
import { useCart } from '../context/CartContext';
import { Product } from '../api/products';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addToCart } = useCart();

    // Format currency cleanly ($10.00)
    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(product.price);

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-200 hover:shadow-md">
            {/* Product Image Container */}
            <div className="aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
                <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=500&q=80'}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
            </div>

            {/* Product Details */}
            <div className="flex flex-1 flex-col p-4">
                <div className="mb-2">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {product.name}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 min-h-[32px]">
                        {product.description}
                    </p>
                </div>

                {/* Price and Add to Cart Action */}
                <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-base font-bold text-zinc-950 dark:text-white">
                        {formattedPrice}
                    </span>

                    <button
                        onClick={() => addToCart(product, 1)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800 active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        title="Add to cart"
                    >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
};