import { useState, useEffect } from 'react';
import { Package, Calendar, CreditCard } from 'lucide-react';
import { api } from '../lib/api';

interface Order {
  _id: string;
  created_at: string;
  total_amount: number;
  order_status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'completed' | 'failed';
  payment_method: string | null;
  items: {
    _id: string;
    quantity: number;
    price: number;
    product: {
      _id: string;
      name: string;
      images: string[];
    };
  }[];
}

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      setError(null);
      const response: Order[] = await api.get('/api/orders');
      setOrders(response);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-24 h-24 mx-auto text-slate-300 mb-6" />
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Error Loading Orders</h2>
          <p className="text-slate-600 mb-8">{error}</p>
          <button 
            onClick={loadOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-24 h-24 mx-auto text-slate-300 mb-6" />
          <h2 className="text-3xl font-bold text-slate-900 mb-4">No Orders Yet</h2>
          <p className="text-slate-600 mb-8">Start shopping to see your orders here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">My Orders</h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-slate-50 p-6 border-b border-slate-200">
                <div className="flex flex-wrap gap-6 justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-600" />
                    <div>
                      <div className="text-sm text-slate-500">Order Date</div>
                      <div className="font-bold text-slate-900">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-slate-600" />
                    <div>
                      <div className="text-sm text-slate-500">Total Amount</div>
                      <div className="font-bold text-slate-900">
                        ₹{Number(order.total_amount).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-500 mb-1">Order Status</div>
                    <span
                      className={`px-4 py-2 rounded-full font-medium text-sm ${
                        order.order_status === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : order.order_status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : order.order_status === 'shipped'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                    </span>
                  </div>

                  <div>
                    <div className="text-sm text-slate-500 mb-1">Payment</div>
                    <span
                      className={`px-4 py-2 rounded-full font-medium text-sm ${
                        order.payment_status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : order.payment_status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex gap-4 items-center">
                      <img
                        src={item.product.images[0] || 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900">{item.product.name}</h3>
                        <p className="text-slate-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">
                          ₹{(Number(item.price) * item.quantity).toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-500">
                          ₹{Number(item.price).toLocaleString()} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
