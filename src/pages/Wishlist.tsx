import { useEffect, useState } from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';

interface WishlistProduct {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  salePrice?: number;
  category: string;
  images: string[];
  stock: number;
}

export function Wishlist() {
  const [wishlistProducts, setWishlistProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const toastApi = useToast();

  useEffect(() => {
    async function loadWishlist() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Clear wishlist cache to get fresh data
        api.invalidateCache('/api/misc/wishlist');
        
        // Get wishlist IDs
        const wishlistData = await api.get('/api/misc/wishlist');
        const wishlistIds = wishlistData.wishlist || [];

        if (wishlistIds.length === 0) {
          setWishlistProducts([]);
          setLoading(false);
          return;
        }

        // Fetch product details for each ID
        const products = await Promise.all(
          wishlistIds.map(id => api.get(`/api/products/${id}`))
        );

        setWishlistProducts(products.filter(p => p !== null));
      } catch (err: any) {
        setError(err.message || 'Failed to load wishlist');
        console.error('Error loading wishlist:', err);
      } finally {
        setLoading(false);
      }
    }

    loadWishlist();
  }, [user]);

  async function handleRemoveFromWishlist(productId: string) {
    try {
      await api.post('/api/misc/wishlist', { productId });
      // Clear cache and refetch
      api.invalidateCache('/api/misc/wishlist');
      setWishlistProducts(prev => prev.filter(p => p._id !== productId));
      toastApi.toast('Removed from wishlist');
    } catch (error) {
      toastApi.error('Failed to remove from wishlist');
    }
  }

  async function handleAddToCart(product: WishlistProduct) {
    try {
      await addToCart(product._id, 1);
      toastApi.success('Added to cart!');
    } catch (error) {
      toastApi.error('Failed to add to cart');
    }
  }

  if (!user) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>
          <p className="text-gray-600 text-lg">Please login to view your wishlist</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Wishlist</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-700">
            {error}
          </div>
        )}

        {wishlistProducts.length === 0 ? (
          <div className="p-12 border border-gray-200 rounded-xl text-center bg-gray-50">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">Your wishlist is currently empty.</p>
            <p className="text-gray-500">Add products to your wishlist to see them here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlistProducts.map((product, index) => (
              <motion.div
                key={product._id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Product Image */}
                <div className="relative h-64 bg-gray-100 overflow-hidden">
                  <img
                    src={product.images[0] || 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  {product.salePrice && product.salePrice < (product.originalPrice ?? product.price) && (
                    <div className="absolute top-4 right-4 bg-rose-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      Sale
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <div className="text-sm font-medium text-primary uppercase mb-2">
                    {product.category.replace('_', ' ')}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-4">
                    {product.salePrice && product.salePrice < (product.originalPrice ?? product.price) ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-rose-600">
                          ₹{product.salePrice.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          ₹{(product.originalPrice ?? product.price).toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-gray-900">
                        ₹{(product.originalPrice ?? product.price).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="mb-4">
                    <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 btn-brand rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add
                    </button>
                    <button
                      onClick={() => handleRemoveFromWishlist(product._id)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
