import { useEffect, useState } from 'react';
import { ArrowLeft, ShoppingCart, Star, Truck, Shield, RefreshCw, Minus, Plus } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

export function ProductDetail({ productId, onBack }: ProductDetailProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get(`/api/products/${productId}`);
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
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900">
        <p className="text-xl text-gray-600 mb-4">{error || 'Product not found'}</p>
        <button onClick={onBack} className="text-primary hover:underline transition-colors">
          Go back to shop
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-white text-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-8 group"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Products</span>
        </motion.button>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div 
              className="bg-gray-50 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden aspect-square border border-gray-200"
              variants={itemVariants}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={product.images[selectedImage] || 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'}
                  alt={`${product.name} image ${selectedImage + 1}`}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
            </motion.div>
            <motion.div className="grid grid-cols-4 gap-4" variants={itemVariants}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedImage === i ? 'border-primary scale-105' : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </motion.div>
          </motion.div>

          <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <div className="text-sm font-medium text-primary uppercase tracking-wider mb-2">
                {product.category.replace('_', ' ')}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="text-gray-600">(4.8 / 127 reviews)</span>
              </div>

              <div className="text-5xl font-extrabold text-gray-900 mb-6">
                ₹{product.price.toLocaleString()}
              </div>

              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {product.description}
              </p>
            </motion.div>

            {product.stock > 0 ? (
              <motion.div className="space-y-4" variants={itemVariants}>
                <div className="flex items-center gap-4">
                  <label className="text-gray-900 font-medium">Quantity:</label>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-200 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={quantity}
                      readOnly
                      className="w-12 text-center py-2 focus:outline-none font-medium bg-transparent"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-2 hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-gray-600 text-sm">
                    ({product.stock} available)
                  </span>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 btn-brand rounded-lg font-bold text-lg hover:opacity-90 transition-all shadow-glow-primary transform hover:scale-[1.02]"
                >
                  <ShoppingCart className="w-6 h-6" />
                  Add to Cart
                </button>
              </motion.div>
            ) : (
              <motion.div className="bg-error/10 border border-error/30 rounded-lg p-4" variants={itemVariants}>
                <p className="text-error font-medium text-center">Out of Stock</p>
              </motion.div>
            )}

            <motion.div className="grid grid-cols-3 gap-4 pt-4" variants={itemVariants}>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <Truck className="w-8 h-8 mx-auto mb-2 text-secondary" />
                <p className="text-sm font-medium text-gray-900">Free Shipping</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <Shield className="w-8 h-8 mx-auto mb-2 text-success" />
                <p className="text-sm font-medium text-gray-900">2 Year Warranty</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                <RefreshCw className="w-8 h-8 mx-auto mb-2 text-warning" />
                <p className="text-sm font-medium text-gray-900">30 Day Returns</p>
              </div>
            </motion.div>

            {product.specs && Object.keys(product.specs).length > 0 && (
              <motion.div className="bg-gray-50 border border-gray-200 rounded-xl p-6" variants={itemVariants}>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications</h2>
                <dl className="space-y-3">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-200 last:border-0">
                      <dt className="text-gray-600 capitalize font-medium">
                        {key.replace('_', ' ')}:
                      </dt>
                      <dd className="text-gray-900 font-medium">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
