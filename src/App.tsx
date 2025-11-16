import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './hooks/useCart';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { AdminDashboard } from './pages/AdminDashboard';
import { Orders } from './pages/Orders';
import { Login } from './pages/Login';
import { ResetPassword } from './pages/ResetPassword';
import { Landing } from './pages/Landing';
import { Wishlist } from './pages/Wishlist';
import { MyAccount } from './pages/MyAccount';
import { Contact } from './pages/Contact';
import { Repair } from './pages/Repair';
import { Accessories } from './pages/Accessories';

type Page = 'landing' | 'shop' | 'product' | 'cart' | 'checkout' | 'admin' | 'orders' | 'login' | 'wishlist' | 'account' | 'contact' | 'repair' | 'accessories' | 'reset-password';

function App() {
  const initialPage: Page = window.location.pathname === '/reset-password' ? 'reset-password' : 'landing';
  const [currentPage, setCurrentPage] = useState<Page>(initialPage);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>(undefined);

  function handleNavigate(page: string, category?: string, subcategory?: string) {
    // Special routing for the new accessories page flow or spare parts
    if ((category === 'accessories' && subcategory?.toLowerCase() === 'phone') || category === 'spare_parts') {
      setCurrentPage('accessories');
    } else {
      setCurrentPage(page as Page);
    }
    
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    
    if (page !== 'product') {
      setSelectedProductId(null);
    }
    window.scrollTo(0, 0);
  }

  function handleSelectProduct(id: string) {
    setSelectedProductId(id);
    setCurrentPage('product');
    window.scrollTo(0, 0);
  }

  function handleCheckout() {
    setCurrentPage('checkout');
  }

  function handleCheckoutSuccess() {
    setCurrentPage('orders');
  }

  function handleLoginSuccess() {
    setCurrentPage('landing');
  }

  function handleResetSuccess() {
    setCurrentPage('login');
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <Landing onNavigate={handleNavigate} onSelectProduct={handleSelectProduct} />;
      case 'shop':
        return (
          <ProductList 
            onSelectProduct={handleSelectProduct}
            initialCategory={selectedCategory}
            initialSubcategory={selectedSubcategory}
          />
        );
      case 'accessories':
        return <Accessories onSelectProduct={handleSelectProduct} category={selectedCategory} subcategory={selectedSubcategory} />;
      case 'product':
        return selectedProductId && <ProductDetail productId={selectedProductId} onBack={() => handleNavigate('shop')} />;
      case 'cart':
        return <Cart onCheckout={handleCheckout} />;
      case 'checkout':
        return <Checkout onSuccess={handleCheckoutSuccess} />;
      case 'admin':
        return <AdminDashboard />;
      case 'orders':
        return <Orders />;
      case 'login':
        return <Login onSuccess={handleLoginSuccess} />;
      case 'wishlist':
        return <Wishlist />;
      case 'account':
        return <MyAccount />;
      case 'contact':
        return <Contact />;
      case 'repair':
        return <Repair />;
      case 'reset-password':
        return <ResetPassword onSuccess={handleResetSuccess} />;
      default:
        return <Landing onNavigate={handleNavigate} onSelectProduct={handleSelectProduct} />;
    }
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-white flex flex-col">
          {currentPage !== 'login' && currentPage !== 'reset-password' && (
            <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
          )}
          <main className="flex-grow">{renderPage()}</main>
          {currentPage !== 'login' && currentPage !== 'reset-password' && <Footer onNavigate={handleNavigate} />}
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
