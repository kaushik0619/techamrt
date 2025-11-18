import { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { CreditCard, MapPin, Check } from 'lucide-react';
import { api } from '../lib/api';

interface CheckoutProps {
  onSuccess: () => void;
}

export function Checkout({ onSuccess }: CheckoutProps) {
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'address' | 'payment'>('address');

  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'razorpay' | 'cod'>('cod');

  async function handlePlaceOrder() {
    setLoading(true);
    try {
      const orderData = {
        shippingAddress: address,
        paymentMethod: paymentMethod
      };

      const response = await api.post('/api/orders', orderData);
      
      clearCart();
      alert('Order placed successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Error placing order:', error);
      alert(error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'address') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-8">Checkout</h1>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-900">Shipping Address</h2>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 body"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <input
                type="text"
                placeholder="Address Line 1"
                value={address.addressLine1}
                onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              <input
                type="text"
                placeholder="Address Line 2 (Optional)"
                value={address.addressLine2}
                onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="State"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={address.postalCode}
                  onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                  className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <button
              onClick={() => setStep('payment')}
              disabled={!address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.state || !address.postalCode}
              className="w-full mt-8 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Payment
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
            <h3 className="font-bold text-slate-900 mb-4">Order Summary</h3>
            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>Items ({items.length})</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-xl font-bold text-slate-900">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Payment Method</h1>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900">Choose Payment Method</h2>
          </div>

          <div className="space-y-4 mb-8">
            <label className="flex items-center p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-5 h-5 text-blue-600"
              />
              <div className="ml-4">
                <div className="font-bold text-slate-900">Cash on Delivery</div>
                <div className="text-sm text-slate-600">Pay when you receive the order</div>
              </div>
            </label>

            <label className="flex items-center p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-blue-500 transition-colors opacity-50">
              <input
                type="radio"
                name="payment"
                value="stripe"
                disabled
                className="w-5 h-5 text-blue-600"
              />
              <div className="ml-4">
                <div className="font-bold text-slate-900">Credit/Debit Card (Stripe)</div>
                <div className="text-sm text-slate-600">Coming soon</div>
              </div>
            </label>

            <label className="flex items-center p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-blue-500 transition-colors opacity-50">
              <input
                type="radio"
                name="payment"
                value="razorpay"
                disabled
                className="w-5 h-5 text-blue-600"
              />
              <div className="ml-4">
                <div className="font-bold text-slate-900">UPI/Razorpay</div>
                <div className="text-sm text-slate-600">Coming soon</div>
              </div>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep('address')}
              className="flex-1 px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all"
            >
              Back
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-600/30 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  <Check className="w-6 h-6" />
                  <span>Place Order</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <h3 className="font-bold text-slate-900 mb-4">Order Summary</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-slate-600">
                <span>{item.product.name} x {item.quantity}</span>
                <span>₹{(item.product.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-xl font-bold text-slate-900">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
