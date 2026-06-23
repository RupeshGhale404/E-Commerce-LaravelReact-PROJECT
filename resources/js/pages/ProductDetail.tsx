import { useEffect, useState, FC } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ShoppingCart, Check, ArrowLeft, Package, Tag,
  AlertCircle, Minus, Plus
} from 'lucide-react';
import { productsApi, Product } from '../api/products';
import { useCart } from '../context/CartContext';

const ProductDetail: FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem, items } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);

  useEffect(() => {
    if (!slug) {
      setError('Product not found.');
      setLoading(false);
      return;
    }
    setLoading(true);
    productsApi
      .getOne(slug)
      .then(({ data }) => setProduct(data.data))
      .catch(() => setError('Product not found.'))
      .finally(() => setLoading(false));
  }, [slug]);

  const cartItem = product ? items.find((i) => i.id === product.id) : null;
  const alreadyInCart = !!cartItem;

  const handleAddToCart = () => {
    if (!product?.in_stock) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-24" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-10 bg-gray-200 rounded w-32 mt-6" />
              <div className="h-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-6">This product doesn't exist or has been removed.</p>
          <Link to="/products" className="text-indigo-600 font-medium hover:underline">
            Browse all products →
          </Link>
        </div>
      </div>
    );
  }

  const maxQty = Math.min(product.stock_quantity, 10);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-gray-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-gray-900 transition-colors">
            Products
          </Link>
          <span>/</span>
          {product.category && (
            <>
              <span className="text-gray-500">{product.category.name}</span>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative bg-gray-50 aspect-square md:aspect-auto min-h-80">
              {product.image_path ? (
                <img
                  src={product.image_path}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-gray-200" />
                </div>
              )}

              {!product.in_stock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold bg-black/60 px-6 py-2 rounded-full">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-8 lg:p-12 flex flex-col">
              {/* Category tag */}
              {product.category && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full self-start mb-4">
                  <Tag className="w-3 h-3" />
                  {product.category.name}
                </span>
              )}

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  ${Number(product.price).toFixed(2)}
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-gray-600 leading-relaxed mb-6">
                  {product.description}
                </p>
              )}

              {/* Stock status */}
              <div className="mb-6">
                {product.in_stock ? (
                  product.stock_quantity <= 5 ? (
                    <div className="flex items-center gap-2 text-amber-600 text-sm font-medium">
                      <AlertCircle className="w-4 h-4" />
                      Only {product.stock_quantity} left in stock — order soon
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                      <Check className="w-4 h-4" />
                      In stock ({product.stock_quantity} available)
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                    <AlertCircle className="w-4 h-4" />
                    Currently out of stock
                  </div>
                )}
              </div>

              {/* Quantity selector */}
              {product.in_stock && (
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-gray-900 font-medium min-w-[3rem] text-center border-x border-gray-200">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                      disabled={quantity >= maxQty}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    added
                      ? 'bg-green-600 text-white'
                      : !product.in_stock
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </>
                  )}
                </button>

                {alreadyInCart && (
                  <Link
                    to="/cart"
                    className="px-6 py-3 rounded-xl font-semibold text-sm border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    View Cart
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mt-6 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;