import { useEffect, useState } from 'react';
import { TrendingUp, Package, DollarSign, Users, ShoppingCart, Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { ProductForm } from '../components/ProductForm';

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

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: 0, totalCustomers: 0, totalProducts: 0 });
  const [salesByRegion, setSalesByRegion] = useState<SalesData[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, salesData, ordersData, productsData] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/sales-by-region'),
        api.get('/api/admin/recent-orders'),
        api.get('/api/admin/products?limit=100')
      ]);
      
      setStats(statsData);
      setSalesByRegion(salesData);
      setRecentOrders(ordersData);
      setProducts(productsData.products);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleProductCreated() {
    loadDashboardData(); // Refresh all data to update product count and list
  }

  async function handleDeleteProduct(productId: string) {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await api.delete(`/api/admin/products/${productId}`);
        loadDashboardData(); // Refresh data after deletion
      } catch (err: any) {
        setError(err.message || 'Failed to delete product');
        console.error('Error deleting product:', err);
      }
    }
  }

  function handleEditProduct(p: any) {
    setEditingProduct(p);
    setShowProductForm(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
          <button
            onClick={() => setShowProductForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add New Product
          </button>
        </div>

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

          <div className="bg-gradient-to-br from-[#E33B57] to-[#D02A47] rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-12 h-12 opacity-80" />
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalProducts}</div>
            <div className="text-red-100">Total Products</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Sales by Region</h2>
            {salesByRegion.length > 0 ? (
              <div className="space-y-4">
                {salesByRegion.map((region) => {
                  const maxAmount = Math.max(...salesByRegion.map(r => r.amount), 1);
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

        {/* Product Management Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Product Management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="p-4 text-sm font-semibold text-slate-600">Product</th>
                  <th className="p-4 text-sm font-semibold text-slate-600 hidden md:table-cell">Category</th>
                  <th className="p-4 text-sm font-semibold text-slate-600 hidden sm:table-cell">Price</th>
                  <th className="p-4 text-sm font-semibold text-slate-600 hidden sm:table-cell">Stock</th>
                  <th className="p-4 text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 flex items-center gap-4">
                      <img 
                        src={product.images[0] || 'https://p_150.png'} 
                        alt={product.name}
                        className="w-10 h-10 rounded-md object-cover"
                      />
                      <span className="font-medium text-slate-800">{product.name}</span>
                    </td>
                    <td className="p-4 text-slate-600 hidden md:table-cell">{product.category}</td>
                    <td className="p-4 text-slate-600 hidden sm:table-cell">₹{product.price.toLocaleString()}</td>
                    <td className="p-4 text-slate-600 hidden sm:table-cell">{product.stock}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          aria-label="Edit product"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="px-3 py-1 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                          aria-label="Edit product images"
                        >
                          Images
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product._id)}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                          aria-label="Delete product"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <p className="text-center py-8 text-slate-500">No products found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          onClose={() => { setShowProductForm(false); setEditingProduct(null); }}
          onSuccess={handleProductCreated}
          initialProduct={editingProduct || undefined}
          productId={editingProduct?._id}
        />
      )}
    </div>
  );
}
