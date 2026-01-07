import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';
import { api } from '../lib/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  subcategory?: string;
  categories?: string[];
  categoriesDetails?: Array<{ category: string; subcategories?: string[] }>;
  stock: number;
  originalPrice?: number;
  salePrice?: number;
  discountPercentage?: number;
}

interface ProductListProps {
  onSelectProduct: (id: string) => void;
  initialCategory?: string;
  initialSubcategory?: string;
  initialSearch?: string;
  initialBrand?: string;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface Filters {
  categories: string[];
  subcategories: string[];
  minPrice: number;
  maxPrice: number;
  brands: string[];
}

const FilterSidebar = ({ 
  filters, 
  onFilterChange, 
  onClearFilters 
}: { 
  filters: Filters;
  onFilterChange: (filterType: keyof Filters, value: any) => void;
  onClearFilters: () => void;
}) => {
  const [priceRange, setPriceRange] = useState(filters.maxPrice);

  // Keep local priceRange in sync when external filters change (e.g., Clear Filters or initial props)
  useEffect(() => {
    setPriceRange(filters.maxPrice);
  }, [filters.maxPrice]);

  const categories = [
    { value: 'accessories', label: 'Accessories' },
    { value: 'spare_parts', label: 'Spare Parts' },
    { value: 'toys_games', label: 'Toys & Games' },
    { value: 'car_accessories', label: 'Car Accessories' },
    { value: 'electronics', label: 'Electronics' },
  ];

  const subcategories = [
    { value: 'phone', label: 'Phone' },
    { value: 'ipad', label: 'iPad' },
    { value: 'airpods', label: 'AirPods' },
    { value: 'laptop', label: 'Laptop' },
  ];

  const brands = [
    { value: 'apple', label: 'apple' },
    { value: 'autogear', label: 'AutoGear' },
    { value: 'hometech', label: 'HomeTech' },
  ];

  const handleCategoryChange = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFilterChange('categories', newCategories);
  };

  const handleSubcategoryChange = (subcategory: string) => {
    const newSubcategories = filters.subcategories.includes(subcategory)
      ? filters.subcategories.filter(s => s !== subcategory)
      : [...filters.subcategories, subcategory];
    onFilterChange('subcategories', newSubcategories);
  };

  const handleBrandChange = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter(b => b !== brand)
      : [...filters.brands, brand];
    onFilterChange('brands', newBrands);
  };

  const handlePriceChange = (value: number) => {
    setPriceRange(value);
    onFilterChange('maxPrice', value);
  };

  const hasActiveFilters = filters.categories.length > 0 || 
                           filters.subcategories.length > 0 || 
                           filters.brands.length > 0 || 
                           filters.maxPrice < 10000000;

  return (
    <aside>
      <div className="space-y-6 p-4 border border-gray-200 rounded-xl sticky top-24 bg-white">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <button 
              onClick={onClearFilters}
              className="text-xs text-primary hover:text-opacity-80 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear All
            </button>
          )}
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category.value} className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-gray-300 bg-transparent text-primary focus:ring-primary cursor-pointer"
                  checked={filters.categories.includes(category.value)}
                  onChange={() => handleCategoryChange(category.value)}
                />
                <span className="ml-3 text-sm text-gray-600">{category.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Subcategories */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Product Type</h3>
          <div className="space-y-2">
            {subcategories.map((subcategory) => (
              <label key={subcategory.value} className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-gray-300 bg-transparent text-primary focus:ring-primary cursor-pointer"
                  checked={filters.subcategories.includes(subcategory.value)}
                  onChange={() => handleSubcategoryChange(subcategory.value)}
                />
                <span className="ml-3 text-sm text-gray-600">{subcategory.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="range"
              min="10"
              max="10000000"
              value={priceRange}
              onChange={(e) => handlePriceChange(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />

            <input
              type="number"
              min={10}
              max={10000000}
              value={priceRange}
              onChange={(e) => {
                const v = Number(e.target.value) || 0;
                // clamp to allowed range
                const clamped = Math.max(10, Math.min(10000000, v));
                setPriceRange(clamped);
                onFilterChange('maxPrice', clamped);
              }}
              className="w-full sm:w-24 p-2 border border-gray-200 rounded text-sm"
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>₹{filters.minPrice}</span>
            <span>₹{priceRange.toLocaleString()}</span>
          </div>
        </div>

        {/* Brands */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Brand</h3>
          <div className="space-y-2">
            {brands.map((brand) => (
              <label key={brand.value} className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-gray-300 bg-transparent text-primary focus:ring-primary cursor-pointer"
                  checked={filters.brands.includes(brand.value)}
                  onChange={() => handleBrandChange(brand.value)}
                />
                <span className="ml-3 text-sm text-gray-600">{brand.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

const ProductCard = ({ product, onSelectProduct }: { product: Product; onSelectProduct: (id: string) => void; }) => (
  <div
    onClick={() => onSelectProduct(product._id)}
    className="bg-white border border-gray-200 rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
  >
    <div className="relative h-56 bg-gray-50">
      <img
        src={product.images[0] || 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'}
        alt={product.name}
        className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
      />
    </div>
    <div className="p-4 text-center">
      <div className="text-xs text-primary font-semibold mb-1 uppercase">
        {product.category.replace('_', ' ')}
        {product.subcategory && ` - ${product.subcategory}`}
      </div>
      <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-primary">{product.name}</h3>
      <div className="flex items-center justify-center mt-4">
        {product.salePrice !== undefined && product.salePrice < (product.originalPrice ?? product.price) ? (
          <div>
            <div className="text-sm text-gray-500 line-through">₹{(product.originalPrice ?? product.price).toFixed(2)}</div>
            <div className="text-lg font-bold text-rose-600">₹{product.salePrice.toFixed(2)}</div>
          </div>
        ) : (
          <p className="text-lg font-bold text-black">₹{(product.originalPrice ?? product.price).toFixed(2)}</p>
        )}
      </div>
    </div>
  </div>
);

export function ProductList({ onSelectProduct, initialCategory, initialSubcategory, initialSearch, initialBrand }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    categories: initialCategory ? [initialCategory] : [],
    subcategories: initialSubcategory ? [initialSubcategory.toLowerCase()] : [],
    minPrice: 0,
    maxPrice: 10000000,
    brands: [],
  });

  console.log('ProductList received:', { initialCategory, initialSubcategory });
  console.log('Initial filters:', filters);

  // Update filters when initialCategory or initialSubcategory changes
  useEffect(() => {
    console.log('Props changed, updating filters:', { initialCategory, initialSubcategory });
    setFilters(prev => ({
      ...prev,
      categories: initialCategory ? [initialCategory] : [],
      subcategories: initialSubcategory ? [initialSubcategory.toLowerCase()] : [],
    }));
  }, [initialCategory, initialSubcategory]);

  // Load products when component mounts and whenever initial filters/search change
  useEffect(() => {
    loadProducts();
  }, [initialCategory, initialSubcategory, initialSearch, initialBrand]);

  // Close mobile drawer when switching to desktop width to avoid layout issues
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024 && mobileFiltersOpen) {
        setMobileFiltersOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [mobileFiltersOpen]);

  useEffect(() => {
    console.log('Applying filters:', filters);
    console.log('Total products:', products.length);
    applyFilters();
  }, [products, filters]);

  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (initialCategory) params.category = initialCategory;
      if (initialSubcategory) params.subcategory = initialSubcategory;
      if ((initialSearch || '').trim()) params.search = initialSearch;
      if (initialBrand) params.brand = initialBrand;
      const response: ProductsResponse = await api.get('/api/products', { params });
      console.log('Loaded products:', response.products);
      console.log('Product categories:', response.products.map(p => ({ name: p.name, category: p.category, subcategory: p.subcategory })));
      setProducts(response.products);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...products];
    console.log('Starting with products:', filtered.length);
    // Combined category + subcategory filtering (case-insensitive, tolerant)
    if (filters.categories.length > 0 || filters.subcategories.length > 0) {
      const normalize = (s: any) => (s || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
      filtered = filtered.filter(product => {
        // gather all tokens representing product categories/subcategories
        const tokens: string[] = [];
        if (product.category) tokens.push(normalize(product.category));
        if (product.subcategory) tokens.push(normalize(product.subcategory));
        if (Array.isArray(product.categories)) product.categories.forEach((c: string) => tokens.push(normalize(c)));
        if (Array.isArray(product.categoriesDetails)) {
          product.categoriesDetails.forEach((cd: any) => {
            if (cd?.category) tokens.push(normalize(cd.category));
            if (Array.isArray(cd?.subcategories)) cd.subcategories.forEach((s: string) => tokens.push(normalize(s)));
          });
        }

        // also include name/description tokens for loose subcategory matching
        const nameDesc = ((product.name || '') + ' ' + (product.description || '')).toLowerCase();

        const matchesToken = (filterToken: string) => {
          if (!filterToken) return false;
          const ft = normalize(filterToken);
          // partial match: any product token contains filter token or vice versa
          for (const t of tokens) {
            if (!t) continue;
            if (t.includes(ft) || ft.includes(t)) return true;
          }
          // fallback: check name/description contains the filter token
          if (nameDesc.includes(filterToken.toLowerCase())) return true;
          return false;
        };

        const categoryMatches = filters.categories.length === 0
          ? true
          : filters.categories.some(c => matchesToken(c));

        const subcategoryMatches = filters.subcategories.length === 0
          ? true
          : filters.subcategories.some(s => matchesToken(s));

        // If both category and subcategory filters are active, treat as a union
        // (show products that match either the selected category OR the selected subcategory).
        // If only one group is active, require that group's match.
        let matches: boolean;
        if (filters.categories.length > 0 && filters.subcategories.length > 0) {
          matches = categoryMatches || subcategoryMatches;
        } else {
          matches = categoryMatches && subcategoryMatches;
        }
        console.log(`Product "${product.name}" tokens=${JSON.stringify(tokens)} matches:`, matches);
        return matches;
      });
      console.log('After combined filters:', filtered.length);
    }

    // Filter by price
    filtered = filtered.filter(product => 
      product.price >= filters.minPrice && product.price <= filters.maxPrice
    );
    console.log('After price filter:', filtered.length);

    console.log('Final filtered products:', filtered);
    setFilteredProducts(filtered);
  }

  function handleFilterChange(filterType: keyof Filters, value: any) {
    console.log('Filter change:', filterType, value);
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }

  function handleClearFilters() {
    setFilters({
      categories: [],
      subcategories: [],
      minPrice: 0,
      maxPrice: 10000000,
      brands: [],
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-error mb-4">{error}</p>
        <button 
          onClick={loadProducts}
          className="px-4 py-2 btn-brand rounded hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${mobileFiltersOpen ? 'product-main-shift' : ''}`}>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Our Collection</h1>
          <p className="text-gray-600 mt-2">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
        {/* Mobile Filters button (only on small screens) */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="px-4 py-2 rounded-md border border-gray-200 bg-white text-gray-700 shadow-sm"
          >
            Filters
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop sidebar - hidden on mobile */}
          <div className="hidden lg:block lg:w-1/4 lg:pr-8">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          <main className="w-full lg:w-3/4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-gray-900 text-lg mb-4">No products found matching your filters</p>
                <p className="text-gray-600 text-sm mb-4">
                  Active filters: {filters.categories.join(', ')} {filters.subcategories.join(', ')}
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2 btn-brand rounded-lg hover:opacity-90"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 scrollbar-hide">
                  {filteredProducts.map((product) => (
                    <div key={product._id} className="w-full">
                      <ProductCard product={product} onSelectProduct={onSelectProduct} />
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                <div className="flex justify-center items-center mt-12 space-x-2">
                  <button className="p-2 rounded-md hover:bg-gray-100">
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="w-8 h-8 rounded-md text-white text-sm font-medium" style={{ background: 'linear-gradient(90deg,#F59B2E,#E33B57,#2AA7DF)' }}>
                    1
                  </button>
                  <button className="w-8 h-8 rounded-md hover:bg-gray-100 text-sm font-medium text-gray-600">
                    2
                  </button>
                  <button className="w-8 h-8 rounded-md hover:bg-gray-100 text-sm font-medium text-gray-600">
                    3
                  </button>
                  <button className="p-2 rounded-md hover:bg-gray-100">
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile left drawer and overlay (only renders when open) */}
      {mobileFiltersOpen && (
        <>
          <div className="fixed left-0 top-0 bottom-0 z-50 w-[70vw] max-w-xs bg-white p-4 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-2 rounded-md hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            <FilterSidebar 
              filters={filters} 
              onFilterChange={handleFilterChange}
              onClearFilters={() => { handleClearFilters(); setMobileFiltersOpen(false); }}
            />
          </div>

          <div
            className="fixed top-0 bottom-0 left-[70vw] right-0 bg-black/20 z-40"
            onClick={() => setMobileFiltersOpen(false)}
          />

          <style>{`
            @media (max-width: 1023px) {
              .product-main-shift { margin-left: 70vw !important; transition: margin-left 200ms ease; }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
