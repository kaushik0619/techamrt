import { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  subcategory?: string;
  brand?: string;
}

interface AccessoriesProps {
  onSelectProduct: (id: string) => void;
  category?: string;
  subcategory?: string;
}

const brandLogos: { [key: string]: string } = {
  'Apple': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
  'Samsung': 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
  'Google': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  'OnePlus': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/OnePlus_logo.svg',
  'Xiaomi': 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Xiaomi_logo_%282021-%29.svg',
};

const ProductCard = ({ product, onSelectProduct }: { product: Product; onSelectProduct: (id: string) => void; }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.3 }}
    onClick={() => onSelectProduct(product._id)}
    className="bg-white border border-neutral-200 rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
  >
    <div className="relative h-56 bg-neutral-50">
      <img
        src={product.images[0] || 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'}
        alt={product.name}
        className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
      />
    </div>
    <div className="p-4 text-center">
      <h3 className="text-base font-semibold text-neutral-900 truncate group-hover:text-primary-DEFAULT">{product.name}</h3>
      <div className="flex items-center justify-center mt-2">
        <p className="text-lg font-bold text-black">₹{product.price.toFixed(2)}</p>
      </div>
    </div>
  </motion.div>
);

export function Accessories({ onSelectProduct, category, subcategory }: AccessoriesProps) {
  // Helpful debug: show which API base the frontend is using at runtime
  // (This is read at build time by Vite; change .env and restart dev server if incorrect.)
  try {
    // eslint-disable-next-line no-console
    console.log('VITE_API_BASE_URL=', import.meta.env.VITE_API_BASE_URL);
  } catch (e) {
    // ignore in environments where import.meta isn't available
  }
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  
  const [protectiveCases, setProtectiveCases] = useState<Product[]>([]);
  const [temperedGlass, setTemperedGlass] = useState<Product[]>([]);
  const [otherAccessories, setOtherAccessories] = useState<Product[]>([]);
  const [loading, setLoading] = useState<'brands' | 'products' | false>(false);
  const [error, setError] = useState<string | null>(null);

  const formatUiCategory = (cat?: string) => {
    if (!cat) return '';
    if (cat === 'spare_parts') return 'Spare Parts';
    return cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const displayCategory = subcategory || formatUiCategory(category);

  useEffect(() => {
    async function fetchBrands() {
      try {
        setLoading('brands');
        setError(null);
        // Map UI subcategory to backend category where appropriate.
        // e.g., UI 'accessories' + subcategory 'Phone' -> backend 'Smartphones'
        const mapUiSubToApiCategory = (uiSub?: string) => {
          if (!uiSub) return undefined;
          if (uiSub.toLowerCase() === 'phone') return 'Smartphones';
          return uiSub;
        };

        // For accessories or spare_parts prefer mapping from subcategory
        // (e.g. UI 'Phone' -> DB 'Smartphones') so Spare Parts -> Phone
        // returns the same brands as Accessories -> Phone.
        let apiCategory: string | undefined;
        if (subcategory) {
          apiCategory = mapUiSubToApiCategory(subcategory) || subcategory;
        } else if (category) {
          // If user clicked the top-level 'Spare Parts' show the same brands
          // as Spare Parts -> Phone (map to 'Smartphones') so they see device brands.
          apiCategory = category === 'spare_parts' ? 'Smartphones' : category;
        }

        const response = await api.get<any>(`/api/products/brands`, {
          params: { category: apiCategory }
        });

        // API may return the array directly or wrap it. Handle both.
        const brandListRaw: string[] = Array.isArray(response)
          ? response
          : response?.data || response?.brands || [];
        const brandList: string[] = Array.from(new Set(brandListRaw.filter(Boolean)));

        // Debug log so we can see response in browser console during development
        // eslint-disable-next-line no-console
        console.log('fetched brands response:', response, 'parsed brandList:', brandList);

        setBrands(brandList);
      } catch (err) {
        setError('Failed to load brands. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    // Fetch brands on mount and whenever category/subcategory change.
    fetchBrands();
  }, [category, subcategory]);

  useEffect(() => {
    async function fetchProducts() {
      if (!selectedBrand) return;
      try {
        setLoading('products');
        setError(null);
        const mapUiSubToApiCategory = (uiSub?: string) => {
          if (!uiSub) return undefined;
          if (uiSub.toLowerCase() === 'phone') return 'Smartphones';
          return uiSub;
        };

        // For accessories or spare_parts prefer mapping from subcategory
        // (e.g. UI 'Phone' -> DB 'Smartphones') so Spare Parts -> Phone
        // returns the same products as Accessories -> Phone.
        let apiCategory: string | undefined;
        if (subcategory) {
          apiCategory = mapUiSubToApiCategory(subcategory) || subcategory;
        } else if (category) {
          apiCategory = category === 'spare_parts' ? 'Smartphones' : category;
        }

        // Build params for fetching products. For spare_parts we must query the
        // DB products where category is 'Spare Parts' (these are the actual
        // spare part items) and, if a UI subcategory was provided (Phone/iPad/etc)
        // pass that along as `subcategory` to filter to that device's parts.
        const params: any = { brand: selectedBrand };
        if (category === 'spare_parts') {
          params.category = 'Spare Parts';
          if (subcategory) params.subcategory = subcategory; // e.g. 'Phone'
        } else {
          // For accessories flow, query the mapped device category (e.g. 'Smartphones')
          if (apiCategory) params.category = apiCategory;
        }

        const response = await api.get<{ products: Product[] }>(`/api/products`, { params });
        const all = response.products || [];

        if (category === 'spare_parts') {
          // For spare parts we want a flat product list for the selected brand
          // (and selected subcategory when provided). Show all matching spare
          // parts as product cards rather than grouped rows.
          setProtectiveCases(all);
          setTemperedGlass([]);
          setOtherAccessories([]);
        } else {
          // For accessories, keep the previous grouping into cases / glass / others
          const cases = all.filter(p => {
            const sc = (p.subcategory || '').toLowerCase();
            const name = p.name.toLowerCase();
            return sc.includes('case') || name.includes('case') || name.includes('cover');
          });

          const glass = all.filter(p => {
            const sc = (p.subcategory || '').toLowerCase();
            const name = p.name.toLowerCase();
            return sc.includes('glass') || name.includes('tempered') || name.includes('screen protector') || name.includes('protector');
          });

          const others = all.filter(p => !cases.includes(p) && !glass.includes(p));

          setProtectiveCases(cases);
          setTemperedGlass(glass);
          setOtherAccessories(others);
        }
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [selectedBrand, category, subcategory]);

  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
  };

  const handleBackToBrands = () => {
    setSelectedBrand(null);
    
    setProtectiveCases([]);
    setTemperedGlass([]);
    setOtherAccessories([]);
  };

  // Refs and state for drag-to-scroll behavior for each horizontal row
  const casesRef = useRef<HTMLDivElement | null>(null);
  const casesDown = useRef(false);
  const casesStartX = useRef(0);
  const casesScrollLeft = useRef(0);

  const glassRef = useRef<HTMLDivElement | null>(null);
  const glassDown = useRef(false);
  const glassStartX = useRef(0);
  const glassScrollLeft = useRef(0);

  const othersRef = useRef<HTMLDivElement | null>(null);
  const othersDown = useRef(false);
  const othersStartX = useRef(0);
  const othersScrollLeft = useRef(0);

  const getPageX = (e: any) => {
    if (e.touches && e.touches.length) return e.touches[0].pageX;
    if (typeof e.pageX === 'number') return e.pageX;
    if (typeof e.clientX === 'number') return e.clientX;
    // react synthetic event: access nativeEvent
    if (e.nativeEvent && typeof e.nativeEvent.pageX === 'number') return e.nativeEvent.pageX;
    return 0;
  };

  const onDragStart = (e: any, ref: React.RefObject<HTMLDivElement>, downRef: any, startXRef: any, scrollLeftRef: any) => {
    downRef.current = true;
    const pageX = getPageX(e);
    startXRef.current = pageX - (ref.current?.offsetLeft ?? 0);
    scrollLeftRef.current = ref.current?.scrollLeft ?? 0;
    ref.current?.classList.add('cursor-grabbing');
  };

  const onDragEnd = (ref: React.RefObject<HTMLDivElement>, downRef: any) => {
    downRef.current = false;
    ref.current?.classList.remove('cursor-grabbing');
  };

  const onDragMove = (e: any, ref: React.RefObject<HTMLDivElement>, downRef: any, startXRef: any, scrollLeftRef: any) => {
    if (!downRef.current || !ref.current) return;
    e.preventDefault();
    const pageX = getPageX(e);
    const x = pageX - (ref.current?.offsetLeft ?? 0);
    const walk = (x - startXRef.current) * 1; // scroll speed multiplier
    ref.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const renderContent = () => {
    if (loading === 'brands') {
      return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-DEFAULT"></div></div>;
    }

    if (error) {
      return <div className="text-center text-red-500 py-10">{error}</div>;
    }

    if (selectedBrand) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center mb-8">
            <button onClick={handleBackToBrands} className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-primary-DEFAULT transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Brands
            </button>
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">
            {selectedBrand} {displayCategory}
          </h2>
          {loading === 'products' ? (
            <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-DEFAULT"></div></div>
          ) : (
            <div>
              {category === 'spare_parts' ? (
                // For spare parts, display a flat grid of product cards for the
                // selected brand (and selected subcategory when provided).
                protectiveCases.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {protectiveCases.map(product => (
                      <ProductCard key={product._id} product={product} onSelectProduct={onSelectProduct} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-neutral-500">No {displayCategory} found for {selectedBrand} in {subcategory || 'this category'}.</p>
                )
              ) : (
                <div className="space-y-12">
                  <section>
                    <h3 className="text-2xl font-semibold text-neutral-900 mb-4 text-center">Protective Cases</h3>
                    {protectiveCases.length > 0 ? (
                      <div
                        ref={casesRef}
                        onMouseDown={(e) => onDragStart(e, casesRef, casesDown, casesStartX, casesScrollLeft)}
                        onMouseUp={() => onDragEnd(casesRef, casesDown)}
                        onMouseLeave={() => onDragEnd(casesRef, casesDown)}
                        onMouseMove={(e) => onDragMove(e, casesRef, casesDown, casesStartX, casesScrollLeft)}
                        onTouchStart={(e) => onDragStart(e, casesRef, casesDown, casesStartX, casesScrollLeft)}
                        onTouchEnd={() => onDragEnd(casesRef, casesDown)}
                        onTouchMove={(e) => onDragMove(e, casesRef, casesDown, casesStartX, casesScrollLeft)}
                        className="flex gap-6 overflow-x-auto py-4"
                        style={{ WebkitOverflowScrolling: 'touch' }}
                      >
                        <AnimatePresence>
                          {protectiveCases.map(product => (
                            <div key={product._id} className="min-w-[240px] flex-shrink-0">
                              <ProductCard product={product} onSelectProduct={onSelectProduct} />
                            </div>
                          ))}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <p className="text-center text-neutral-500">No protective cases found for {selectedBrand}.</p>
                    )}
                  </section>

                  <section>
                    <h3 className="text-2xl font-semibold text-neutral-900 mb-4 text-center">Screen protector</h3>
                    {temperedGlass.length > 0 ? (
                      <div
                        ref={glassRef}
                        onMouseDown={(e) => onDragStart(e, glassRef, glassDown, glassStartX, glassScrollLeft)}
                        onMouseUp={() => onDragEnd(glassRef, glassDown)}
                        onMouseLeave={() => onDragEnd(glassRef, glassDown)}
                        onMouseMove={(e) => onDragMove(e, glassRef, glassDown, glassStartX, glassScrollLeft)}
                        onTouchStart={(e) => onDragStart(e, glassRef, glassDown, glassStartX, glassScrollLeft)}
                        onTouchEnd={() => onDragEnd(glassRef, glassDown)}
                        onTouchMove={(e) => onDragMove(e, glassRef, glassDown, glassStartX, glassScrollLeft)}
                        className="flex gap-6 overflow-x-auto py-4"
                        style={{ WebkitOverflowScrolling: 'touch' }}
                      >
                        <AnimatePresence>
                          {temperedGlass.map(product => (
                            <div key={product._id} className="min-w-[240px] flex-shrink-0">
                              <ProductCard product={product} onSelectProduct={onSelectProduct} />
                            </div>
                          ))}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <p className="text-center text-neutral-500">No tempered glass products found for {selectedBrand}.</p>
                    )}
                  </section>

                  <section>
                    <h3 className="text-2xl font-semibold text-neutral-900 mb-4 text-center">Other Accessories</h3>
                    {otherAccessories.length > 0 ? (
                      <div
                        ref={othersRef}
                        onMouseDown={(e) => onDragStart(e, othersRef, othersDown, othersStartX, othersScrollLeft)}
                        onMouseUp={() => onDragEnd(othersRef, othersDown)}
                        onMouseLeave={() => onDragEnd(othersRef, othersDown)}
                        onMouseMove={(e) => onDragMove(e, othersRef, othersDown, othersStartX, othersScrollLeft)}
                        onTouchStart={(e) => onDragStart(e, othersRef, othersDown, othersStartX, othersScrollLeft)}
                        onTouchEnd={() => onDragEnd(othersRef, othersDown)}
                        onTouchMove={(e) => onDragMove(e, othersRef, othersDown, othersStartX, othersScrollLeft)}
                        className="flex gap-6 overflow-x-auto py-4"
                        style={{ WebkitOverflowScrolling: 'touch' }}
                      >
                        <AnimatePresence>
                          {otherAccessories.map(product => (
                            <div key={product._id} className="min-w-[240px] flex-shrink-0">
                              <ProductCard product={product} onSelectProduct={onSelectProduct} />
                            </div>
                          ))}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <p className="text-center text-neutral-500">No other accessories found for {selectedBrand}.</p>
                    )}
                  </section>
                </div>
              )}
            </div>
          )}
        </motion.div>
      );
    }

    return (
      <div>
        <h1 className="text-4xl font-bold text-neutral-900 text-center">Choose a Brand</h1>
        <p className="text-neutral-600 mt-2 text-center mb-12">
          Select a brand to see available {displayCategory}.
        </p>
        {brands.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {brands.map(brand => (
              <motion.div
                key={brand}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBrandSelect(brand)}
                className="bg-white border border-neutral-200 rounded-xl p-8 flex justify-center items-center cursor-pointer transition-shadow hover:shadow-lg"
              >
                <img 
                  src={brandLogos[brand] || `https://via.placeholder.com/150x50?text=${brand}`} 
                  alt={brand} 
                  className="h-12 object-contain"
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-neutral-500">No brands found for this category.</p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedBrand || 'brands'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
