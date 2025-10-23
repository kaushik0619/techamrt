import { useEffect, useState } from 'react';
import { TrendingUp, Package, DollarSign, Users, ShoppingCart } from 'lucide-react';
import { api } from '../lib/api';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
}

interface SalesData {
  region: string;
  amount: number;
  count: number;
}

interface RecentOrder {
  _id: string;
  created_at: string;
  total_amount: number;
  order_status: string;
  payment_status: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: 0, totalCustomers: 0, totalProducts: 0 });
  const [salesByRegion, setSalesByRegion] = useState<SalesData[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, salesData, ordersData] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/sales-by-region'),
        api.get('/admin/recent-orders')
      ]);
      
      setStats(statsData);
      setSalesByRegion(salesData);
      setRecentOrders(ordersData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-DEFAULT"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Error Loading Dashboard</h2>
          <p className="text-slate-600 mb-8">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-12 h-12 opacity-80" />
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold mb-1">
              ₹{stats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-blue-100">Total Revenue</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <ShoppingCart className="w-12 h-12 opacity-80" />
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalOrders}</div>
            <div className="text-green-100">Total Orders</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-12 h-12 opacity-80" />
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalCustomers}</div>
            <div className="text-orange-100">Total Customers</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-12 h-12 opacity-80" />
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalProducts}</div>
            <div className="text-purple-100">Total Products</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Sales by Region</h2>
            {salesByRegion.length > 0 ? (
              <div className="space-y-4">
                {salesByRegion.map((region) => {
                  const maxAmount = salesByRegion[0].amount;
                  const percentage = (region.amount / maxAmount) * 100;

                  return (
                    <div key={region.region}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-slate-700">{region.region}</span>
                        <span className="font-bold text-slate-900">
                          ₹{region.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        {region.count} orders
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No sales data available</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Recent Orders</h2>
            {recentOrders.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="border-l-4 border-blue-500 pl-4 py-3 hover:bg-slate-50 transition-colors rounded-r"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-slate-900">{order.user.username}</div>
                        <div className="text-sm text-slate-500">{order.user.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">
                          ₹{Number(order.total_amount).toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          order.order_status === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.order_status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {order.order_status}
                      </span>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          order.payment_status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : order.payment_status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No orders yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
