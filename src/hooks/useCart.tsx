import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const data = await api.get('/api/cart');
      // Transform MongoDB _id to id for frontend
      const transformedData = Array.isArray(data) ? data.map((item: any) => ({
        ...item,
        id: item._id,
        product: {
          ...item.product,
          id: item.product._id
        }
      })) : [];
      setItems(transformedData);
    } catch (error) {
      console.error('Failed to load cart:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  async function addToCart(productId: string, quantity: number = 1) {
    if (!user) throw new Error('Please login to add items to cart');
    await api.post('/api/cart', { productId, quantity });
    await loadCart();
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    await api.put(`/api/cart/${itemId}`, { quantity });
    await loadCart();
  }

  async function removeFromCart(itemId: string) {
    await api.delete(`/api/cart/${itemId}`);
    await loadCart();
  }

  async function clearCart() {
    if (!user) return;
    await api.delete('/api/cart');
    setItems([]);
  }

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    items,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    total,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
