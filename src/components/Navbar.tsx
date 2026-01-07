import { useState, useEffect, useRef, Fragment } from 'react';
import { Heart, ShoppingBag, User, LogOut, LayoutDashboard, Package, ChevronDown, Menu, X } from 'lucide-react';
import SearchBar from './SearchBar';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../hooks/useCart';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onNavigate: (page: string, category?: string, subcategory?: string, search?: string, brand?: string) => void;
  currentPage: string;
}

const navItems = [
  { name: 'Home', page: 'landing' },
  {
    name: 'Accessories',
    page: 'shop',
    category: 'accessories',
    subItems: ['Phone', 'iPad', 'AirPods', 'Laptop'],
  },
  {
    name: 'Spare Parts',
    page: 'shop',
    category: 'spare_parts',
    subItems: ['Phone', 'iPad', 'AirPods', 'Laptop'],
  },
  { name: 'Toys & Games', page: 'shop', category: 'toys_games' },
  { name: 'Car Accessories', page: 'shop', category: 'car_accessories' },
  { name: 'Repair', page: 'repair' },
  { name: 'Contact Us', page: 'contact' },
];

interface DropdownMenuProps {
  subItems: string[];
  onItemClick: (subItem: string) => void;
}

const DropdownMenu = ({ subItems, onItemClick }: DropdownMenuProps) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2, ease: 'easeInOut' }}
    className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20"
  >
    {subItems.map((item) => (
      <button
        key={item}
        onClick={() => onItemClick(item)}
        className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-primary-DEFAULT transition-colors"
      >
        {item}
      </button>
    ))}
  </motion.div>
);

export function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavItemClick = (page: string, category?: string) => {
    setHoveredItem(null); // Close any open dropdown
    onNavigate(page, category);
  };

  const handleSubItemClick = (page: string, category: string, subItem: string) => {
    setHoveredItem(null); // Close dropdown
    onNavigate(page, category, subItem);
  };

  const handleMobileNavClick = (page: string, category?: string) => {
    onNavigate(page, category);
    setIsMobileMenuOpen(false);
  };

  const handleMobileSubItemClick = (page: string, category: string, subItem: string) => {
    onNavigate(page, category, subItem);
    setIsMobileMenuOpen(false);
  };

  const navLinkClasses = (page: string, isShopItem: boolean) => {
    const isActive = isShopItem ? false : currentPage === page;
    return `relative text-sm font-medium transition-colors ${
      isActive
        ? 'text-white'
        : 'text-neutral-400 hover:text-white'
    } after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-full after:h-[2px] after:bg-gradient-to-r after:from-[#F59B2E] after:via-[#E33B57] after:to-[#2AA7DF] after:transition-transform after:duration-300 ${
      isActive ? 'after:scale-x-100' : 'after:scale-x-0'
    } hover:after:scale-x-100`;
  };

  return (
    <header className="bg-[#000000] text-white sticky top-0 z-50 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left Section */}
          <div className="flex items-center gap-8">
            <button onClick={() => handleNavItemClick('landing')} className="text-xl font-bold">
              <img 
                src="/logo.png"
                alt="ABC Accessories But Cheaper"
                className="h-12 md:h-15 w-150"
              />
            </button>
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const hasDropdown = !!item.subItems;
                const isShopItem = item.page === 'shop';
                // Make Accessories and Spare Parts non-clickable if they have sub-items
                const isNonClickable = hasDropdown && (item.name === 'Accessories' || item.name === 'Spare Parts');
                
                return (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => hasDropdown && setHoveredItem(item.name)}
                    onMouseLeave={() => hasDropdown && setHoveredItem(null)}
                  >
                    <button 
                      onClick={() => !isNonClickable && handleNavItemClick(item.page, item.category)} 
                      className={`${navLinkClasses(item.page, isShopItem)} flex items-center gap-1 ${isNonClickable ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {item.name}
                      {hasDropdown && <ChevronDown className="w-4 h-4" />}
                    </button>
                    <AnimatePresence>
                      {hasDropdown && hoveredItem === item.name && (
                        <DropdownMenu 
                          subItems={item.subItems!} 
                          onItemClick={(subItem) => handleSubItemClick(item.page, item.category!, subItem)}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Search input - expands on small interaction */}
            <SearchBar onSearch={(q) => onNavigate('shop', undefined, undefined, q)} />
            <button onClick={() => handleNavItemClick('wishlist')} className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button onClick={() => handleNavItemClick('cart')} className="relative p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary-DEFAULT text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            <div className="hidden md:block w-px h-6 bg-neutral-700"></div>

            {user ? (
              <div className="hidden md:block relative" ref={userMenuRef}>
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-neutral-700 rounded-full flex items-center justify-center text-neutral-300 font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </button>
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 origin-top-right bg-white text-black rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1"
                    >
                      <div className="px-4 py-3 border-b border-neutral-200">
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </div>
                      {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          handleNavItemClick('admin');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-100 flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </button>
                      )}
                      <button
                        onClick={() => {
                          handleNavItemClick('orders');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-100 flex items-center gap-2"
                      >
                        <Package className="w-4 h-4" />
                        Orders
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-100 flex items-center gap-2 text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button onClick={() => handleNavItemClick('login')} className="hidden md:block text-sm font-medium text-neutral-400 hover:text-white">
                Login
              </button>
            )}
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-neutral-400 hover:text-white">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 bg-[#000000] z-50 p-6 md:hidden overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <img src="/logo.png" alt="ABC Accessories But Cheaper" className="h-10 md:h-12" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-neutral-400 hover:text-white">
                <X className="w-7 h-7" />
              </button>
            </div>
            <nav className="flex flex-col gap-6">
              {navItems.map(item => {
                const hasDropdown = !!item.subItems;
                const isNonClickable = hasDropdown && (item.name === 'Accessories' || item.name === 'Spare Parts');
                
                return (
                <Fragment key={item.name}>
                  <button 
                    onClick={() => !isNonClickable && handleMobileNavClick(item.page, item.category)} 
                    className={`text-left text-lg font-medium text-neutral-300 hover:text-primary-DEFAULT transition-colors ${isNonClickable ? 'cursor-default opacity-75' : 'cursor-pointer'}`}
                  >
                    {item.name}
                  </button>
                  {item.subItems && (
                    <div className="pl-4 flex flex-col gap-3 -mt-2">
                      {item.subItems.map(sub => (
                        <button 
                          key={sub} 
                          onClick={() => handleMobileSubItemClick(item.page, item.category!, sub)}
                          className="text-left text-neutral-400 hover:text-primary-DEFAULT transition-colors"
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </Fragment>
                );
              })}
              
              {/* Authentication-related items for mobile */}
              <div className="border-t border-neutral-800 pt-6 mt-2">
                {user ? (
                  <>
                    <div className="mb-4 pb-4 border-b border-neutral-800">
                      <p className="text-sm font-medium text-neutral-300">{user.username}</p>
                      <p className="text-xs text-neutral-500">{user.email}</p>
                    </div>
                    {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        handleMobileNavClick('admin');
                      }}
                      className="w-full text-left text-lg font-medium text-neutral-300 hover:text-primary-DEFAULT transition-colors flex items-center gap-2 mb-4"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Dashboard
                    </button>
                    )}
                    <button
                      onClick={() => {
                        handleMobileNavClick('orders');
                      }}
                      className="w-full text-left text-lg font-medium text-neutral-300 hover:text-primary-DEFAULT transition-colors flex items-center gap-2 mb-4"
                    >
                      <Package className="w-5 h-5" />
                      Orders
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left text-lg font-medium text-red-500 hover:text-red-600 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      handleMobileNavClick('login');
                    }}
                    className="w-full text-left text-lg font-medium text-neutral-300 hover:text-primary-DEFAULT transition-colors"
                  >
                    Login
                  </button>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
