import { useEffect, useState } from 'react';
import { ArrowLeft, ShoppingCart, Star, Truck, Shield, RefreshCw } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
  specs: Record<string, any> | null;
}

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
}

export function ProductDetail({ productId, onBack }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get(`/products/${productId}`);
        setProduct(data);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  async function handleAddToCart() {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }
    if (!product) return;

    try {
      await addToCart(product._id, quantity);
      alert('Added to cart!');
    } catch (error) {
      alert('Failed to add to cart');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-text">
        <p className="text-xl text-textSecondary mb-4">{error || 'Product not found'}</p>
        <button onClick={onBack} className="text-primary hover:text-secondary transition-colors">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-textSecondary hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Products</span>
        </button>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="bg-surface rounded-2xl shadow-2xl shadow-black/20 overflow-hidden aspect-square border border-border">
              <img
                src={product.images[0] || 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="text-sm font-medium text-primary uppercase tracking-wide mb-2">
                {product.category.replace('_', ' ')}
              </div>
              <h1 className="text-4xl font-bold text-text mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="text-textSecondary">(4.8 / 127 reviews)</span>
              </div>

              <div className="text-5xl font-bold text-text mb-6">
                ₹{product.price.toLocaleString()}
              </div>

              <p className="text-lg text-textSecondary leading-relaxed mb-8">
                {product.description}
              </p>

              {product.stock > 0 ? (
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4">
                    <label className="text-text font-medium">Quantity:</label>
                    <div className="flex items-center border-2 border-border rounded-lg overflow-hidden bg-surface">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 hover:bg-neutral-700 transition-colors font-medium"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                        className="w-20 text-center py-2 focus:outline-none font-medium bg-transparent"
                      />
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-4 py-2 hover:bg-neutral-700 transition-colors font-medium"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-textSecondary">
                      ({product.stock} available)
                    </span>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-purple-500 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    Add to Cart
                  </button>
                </div>
              ) : (
                <div className="bg-error/10 border border-error/30 rounded-xl p-4 mb-8">
                  <p className="text-error font-medium text-center">Out of Stock</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-surface border border-border rounded-xl p-4 text-center shadow-md">
                  <Truck className="w-8 h-8 mx-auto mb-2 text-secondary" />
                  <p className="text-sm font-medium text-text">Free Shipping</p>
                </div>
                <div className="bg-surface border border-border rounded-xl p-4 text-center shadow-md">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-success" />
                  <p className="text-sm font-medium text-text">2 Year Warranty</p>
                </div>
                <div className="bg-surface border border-border rounded-xl p-4 text-center shadow-md">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 text-warning" />
                  <p className="text-sm font-medium text-text">30 Day Returns</p>
                </div>
              </div>

              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="bg-surface border border-border rounded-xl p-6 shadow-lg">
                  <h2 className="text-xl font-bold text-text mb-4">Specifications</h2>
                  <dl className="space-y-3">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-border last:border-0">
                        <dt className="text-textSecondary capitalize font-medium">
                          {key.replace('_', ' ')}:
                        </dt>
                        <dd className="text-text font-medium">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
