import { useState, useEffect } from 'react';
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
    // push a new history entry so browser Back/Forward works with app state
    try {
      const state = { page, category, subcategory, productId: page === 'product' ? selectedProductId : null };
      let url = '/';
      if (page === 'shop') url = '/shop' + (category ? `/${category}` : '');
      else if (page === 'accessories') url = '/accessories' + (category ? `/${category}` : '');
      else if (page === 'product' && selectedProductId) url = `/product/${selectedProductId}`;
      else if (page === 'cart') url = '/cart';
      else if (page === 'checkout') url = '/checkout';
      else if (page === 'login') url = '/login';
      else if (page === 'orders') url = '/orders';
      else if (page === 'account') url = '/account';
      else if (page === 'contact') url = '/contact';
      else if (page === 'repair') url = '/repair';
      else if (page === 'reset-password') url = '/reset-password';
      else url = '/';
      window.history.pushState(state, '', url);
    } catch (err) {
      // ignore - history may not be available in some environments
    }
  }

  function handleSelectProduct(id: string) {
    setSelectedProductId(id);
    setCurrentPage('product');
    window.scrollTo(0, 0);
    try {
      const state = { page: 'product', category: selectedCategory, subcategory: selectedSubcategory, productId: id };
      window.history.pushState(state, '', `/product/${id}`);
    } catch (err) {
      // ignore
    }
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
    try { window.history.pushState({ page: 'login' }, '', '/login'); } catch {}
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

  useEffect(() => {
    // Initialize history state if missing
    try {
      const s = window.history.state;
      if (s && s.page) {
        // restore from history state
        setCurrentPage(s.page as Page);
        setSelectedCategory(s.category);
        setSelectedSubcategory(s.subcategory);
        setSelectedProductId(s.productId ?? null);
      } else {
        // push current initial page so Back doesn't leave app immediately
        window.history.replaceState({ page: currentPage }, '', window.location.pathname || '/');
      }

      const onPop = (ev: PopStateEvent) => {
        const st = (ev.state as any) || {};
        if (st.page) {
          setCurrentPage(st.page as Page);
          setSelectedCategory(st.category);
          setSelectedSubcategory(st.subcategory);
          setSelectedProductId(st.productId ?? null);
          window.scrollTo(0, 0);
        } else {
          // If no state, fall back to landing page
          setCurrentPage('landing');
          setSelectedProductId(null);
          setSelectedCategory(undefined);
          setSelectedSubcategory(undefined);
        }
      };

      window.addEventListener('popstate', onPop);
      return () => window.removeEventListener('popstate', onPop);
    } catch (err) {
      // ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
