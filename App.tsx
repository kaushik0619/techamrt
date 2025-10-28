import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './hooks/useCart';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        {/* Rest of your application components */}
      </CartProvider>
    </AuthProvider>
  );
}
