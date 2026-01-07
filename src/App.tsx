import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './hooks/useCart';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastProvider } from './contexts/ToastContext';
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
import AboutUs from './pages/AboutUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import RefundPolicy from './pages/RefundPolicy';

type Page = 'landing' | 'shop' | 'product' | 'cart' | 'checkout' | 'admin' | 'orders' | 'login' | 'wishlist' | 'account' | 'contact' | 'repair' | 'accessories' | 'reset-password' | 'about-us' | 'privacy-policy' | 'terms-and-conditions' | 'refund-policy';

function App() {
  const initialPage: Page = window.location.pathname === '/reset-password' ? 'reset-password' : 'landing';
  const [currentPage, setCurrentPage] = useState<Page>(initialPage);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>(undefined);
  const [selectedSearch, setSelectedSearch] = useState<string | undefined>(undefined);
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(undefined);

  // Parse URL on mount to handle page refresh and direct navigation
  useEffect(() => {
    const pathname = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    // Handle different routes
    if (pathname === '/' || pathname === '') {
      setCurrentPage('landing');
    } else if (pathname.startsWith('/shop')) {
      setCurrentPage('shop');
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length > 1) setSelectedCategory(parts[1]);
      if (parts.length > 2) setSelectedSubcategory(decodeURIComponent(parts[2]));
      if (searchParams.has('search')) setSelectedSearch(searchParams.get('search') || undefined);
      if (searchParams.has('brand')) setSelectedBrand(searchParams.get('brand') || undefined);
    } else if (pathname.startsWith('/product/')) {
      const productId = pathname.split('/').pop();
      if (productId) {
        setCurrentPage('product');
        setSelectedProductId(productId);
      }
    } else if (pathname.startsWith('/accessories')) {
      setCurrentPage('accessories');
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length > 1) setSelectedCategory(parts[1]);
    } else if (pathname === '/cart') {
      setCurrentPage('cart');
    } else if (pathname === '/checkout') {
      setCurrentPage('checkout');
    } else if (pathname === '/login') {
      setCurrentPage('login');
    } else if (pathname === '/reset-password') {
      setCurrentPage('reset-password');
    } else if (pathname === '/orders') {
      setCurrentPage('orders');
    } else if (pathname === '/admin') {
      setCurrentPage('admin');
    } else if (pathname === '/wishlist') {
      setCurrentPage('wishlist');
    } else if (pathname === '/account') {
      setCurrentPage('account');
    } else if (pathname === '/contact') {
      setCurrentPage('contact');
    } else if (pathname === '/repair') {
      setCurrentPage('repair');
    } else if (pathname === '/about-us') {
      setCurrentPage('about-us');
    } else if (pathname === '/privacy-policy') {
      setCurrentPage('privacy-policy');
    } else if (pathname === '/terms-and-conditions') {
      setCurrentPage('terms-and-conditions');
    } else if (pathname === '/refund-policy') {
      setCurrentPage('refund-policy');
    } else {
      // Fallback to landing for unknown routes
      setCurrentPage('landing');
    }
  }, []);

  function handleNavigate(page: string, category?: string, subcategory?: string, search?: string, brand?: string) {
    // Special routing for the new accessories page flow or spare parts
    if ((category === 'accessories' && subcategory?.toLowerCase() === 'phone') || category === 'spare_parts') {
      setCurrentPage('accessories');
    } else {
      setCurrentPage(page as Page);
    }
    
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setSelectedSearch(search);
    setSelectedBrand(brand);
    
    if (page !== 'product') {
      setSelectedProductId(null);
    }
    window.scrollTo(0, 0);
    // push a new history entry so browser Back/Forward works with app state
    try {
      const state = { page, category, subcategory, search, brand, productId: page === 'product' ? selectedProductId : null };
      let url = '/';
      if (page === 'shop') {
        url = '/shop';
        if (category) url += `/${category}`;
        if (subcategory) url += `/${encodeURIComponent(String(subcategory))}`;
        const qp = new URLSearchParams();
        if (search) qp.set('search', String(search));
        if (brand) qp.set('brand', String(brand));
        const q = qp.toString();
        if (q) url += `?${q}`;
      } else if (page === 'accessories') url = '/accessories' + (category ? `/${category}` : '');
      else if (page === 'product' && selectedProductId) url = `/product/${selectedProductId}`;
      else if (page === 'cart') url = '/cart';
      else if (page === 'checkout') url = '/checkout';
      else if (page === 'login') url = '/login';
      else if (page === 'orders') url = '/orders';
      else if (page === 'account') url = '/account';
      else if (page === 'contact') url = '/contact';
      else if (page === 'repair') url = '/repair';
      else if (page === 'about-us') url = '/about-us';
      else if (page === 'privacy-policy') url = '/privacy-policy';
      else if (page === 'terms-and-conditions') url = '/terms-and-conditions';
      else if (page === 'refund-policy') url = '/refund-policy';
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
    const redirect = sessionStorage.getItem('postAuthRedirect');
    if (redirect === 'checkout') {
      setCurrentPage('checkout');
      sessionStorage.removeItem('postAuthRedirect');
      try { window.history.pushState({ page: 'checkout' }, '', '/checkout'); } catch {}
      return;
    }
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
            initialSearch={selectedSearch}
            initialBrand={selectedBrand}
          />
        );
      case 'accessories':
        return <Accessories onSelectProduct={handleSelectProduct} category={selectedCategory} subcategory={selectedSubcategory} />;
      case 'product':
        return selectedProductId && <ProductDetail productId={selectedProductId} onBack={() => handleNavigate('shop')} />;
      case 'cart':
        return <Cart onCheckout={handleCheckout} onNavigate={handleNavigate} />;
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
      case 'about-us':
        return <AboutUs />;
      case 'privacy-policy':
        return <PrivacyPolicy />;
      case 'terms-and-conditions':
        return <TermsAndConditions />;
      case 'refund-policy':
        return <RefundPolicy />;
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
        setSelectedSearch(s.search ?? undefined);
        setSelectedBrand(s.brand ?? undefined);
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
          setSelectedSearch(st.search ?? undefined);
          setSelectedBrand(st.brand ?? undefined);
          window.scrollTo(0, 0);
        } else {
          // If no state, fall back to landing page
          setCurrentPage('landing');
          setSelectedProductId(null);
          setSelectedCategory(undefined);
          setSelectedSubcategory(undefined);
          setSelectedSearch(undefined);
          setSelectedBrand(undefined);
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
        <ToastProvider>
          <div className="min-h-screen bg-white flex flex-col">
            {currentPage !== 'login' && currentPage !== 'reset-password' && (
              <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
            )}
            <main className="flex-grow">{renderPage()}</main>
            {currentPage !== 'login' && currentPage !== 'reset-password' && <Footer onNavigate={handleNavigate} />}
          </div>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
