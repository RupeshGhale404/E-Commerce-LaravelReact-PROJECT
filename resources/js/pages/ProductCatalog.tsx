import { useState, FC } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../api/products';

interface ProductCardProps {
  product: Product;
}

const ProductCard: FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const [added, setAdded] = useState<boolean>(false);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!product.in_stock) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-indigo-100 transition-all duration-300 flex flex-col"
    >
      {/* Product image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {product.image_path ? (
          <img
            src={product.image_path}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-gray-200" />
          </div>
        )}

        {/* Stock badge */}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {product.in_stock && product.stock_quantity <= 5 && (
          <div className="absolute top-2 left-2">
            <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded-full">
              Only {product.stock_quantity} left
            </span>
          </div>
        )}

        {/* Category badge */}
        {product.category && (
          <div className="absolute top-2 right-2">
            <span className="bg-white/90 backdrop-blur-sm text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
              {product.category.name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-gray-500 text-xs mt-1 line-clamp-2 flex-1">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-gray-900">
            ${Number(product.price).toFixed(2)}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={!product.in_stock || added}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              added
                ? 'bg-green-100 text-green-700'
                : !product.in_stock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;