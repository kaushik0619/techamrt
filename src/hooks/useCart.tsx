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
    setLoading(true);
    try {
      if (!user) {
        // Load cart from localStorage for anonymous users
        const raw = localStorage.getItem('local_cart');
        const local = raw ? JSON.parse(raw) : [];
        setItems(Array.isArray(local) ? local : []);
        setLoading(false);
        return;
      }

      // If user has local cart, sync it to server then clear
      try {
        const raw = localStorage.getItem('local_cart');
        const local = raw ? JSON.parse(raw) : [];
        if (Array.isArray(local) && local.length > 0) {
          for (const li of local) {
            try {
              await api.post('/api/cart', { productId: li.product.id || li.product_id, quantity: li.quantity });
            } catch (e) {
              // ignore individual sync errors
            }
          }
          localStorage.removeItem('local_cart');
        }
      } catch (e) {
        // ignore local sync errors
      }

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
    if (!user) {
      // For anonymous users, maintain a local cart in localStorage
      try {
        // Try to fetch product details for display
        const product = await api.get(`/api/products/${productId}`);
        const id = `local-${productId}`;
        const existing = items.find((it) => it.id === id || it.product.id === productId);
        let newItems = [...items];
        if (existing) {
          newItems = newItems.map((it) => it.id === existing.id ? { ...it, quantity: Math.min((it.quantity || 0) + quantity, product.stock) } : it);
        } else {
          newItems.push({
            id,
            product_id: productId,
            quantity,
            product: {
              id: product._id,
              name: product.name,
              price: product.price,
              images: product.images || [],
              stock: product.stock || 0,
            }
          } as any);
        }
        localStorage.setItem('local_cart', JSON.stringify(newItems));
        setItems(newItems);
        return;
      } catch (err) {
        console.error('Failed to add to local cart:', err);
        throw err;
      }
    }

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
    if (!user && itemId.startsWith('local-')) {
      const raw = localStorage.getItem('local_cart');
      const local = raw ? JSON.parse(raw) : [];
      const filtered = Array.isArray(local) ? local.filter((it: any) => it.id !== itemId) : [];
      localStorage.setItem('local_cart', JSON.stringify(filtered));
      setItems(filtered);
      return;
    }
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
