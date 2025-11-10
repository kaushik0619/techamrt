import { useState, useEffect } from 'react';
import { Star, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { api } from '../lib/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  subcategory?: string;
  stock: number;
}

interface ProductListProps {
  onSelectProduct: (id: string) => void;
  initialCategory?: string;
  initialSubcategory?: string;
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
    { value: 'techpro', label: 'TechPro' },
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
    <aside className="w-full lg:w-1/4 lg:pr-8">
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
          <input
            type="range"
            min="10"
            max="10000000"
            value={priceRange}
            onChange={(e) => handlePriceChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
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
        <p className="text-lg font-bold text-primary">₹{product.price.toFixed(2)}</p>
      </div>
    </div>
  </div>
);

export function ProductList({ onSelectProduct, initialCategory, initialSubcategory }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
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

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    console.log('Applying filters:', filters);
    console.log('Total products:', products.length);
    applyFilters();
  }, [products, filters]);

  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);
      const response: ProductsResponse = await api.get('/products');
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

    // Filter by categories
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => {
        const matches = filters.categories.includes(product.category);
        console.log(`Product "${product.name}" category "${product.category}" matches:`, matches);
        return matches;
      });
      console.log('After category filter:', filtered.length);
    }

    // Filter by subcategories
    if (filters.subcategories.length > 0) {
      filtered = filtered.filter(product => {
        // Check if product has subcategory field
        if (product.subcategory) {
          const matches = filters.subcategories.includes(product.subcategory.toLowerCase());
          console.log(`Product "${product.name}" subcategory "${product.subcategory}" matches:`, matches);
          return matches;
        }
        // Also check name and description as fallback
        const nameMatch = filters.subcategories.some(sub => 
          product.name.toLowerCase().includes(sub.toLowerCase())
        );
        const descMatch = filters.subcategories.some(sub => 
          product.description?.toLowerCase().includes(sub.toLowerCase())
        );
        console.log(`Product "${product.name}" name/desc match:`, nameMatch || descMatch);
        return nameMatch || descMatch;
      });
      console.log('After subcategory filter:', filtered.length);
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
          className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Our Collection</h1>
          <p className="text-gray-600 mt-2">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar 
            filters={filters} 
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
          
          <main className="w-full lg:w-3/4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-gray-900 text-lg mb-4">No products found matching your filters</p>
                <p className="text-gray-600 text-sm mb-4">
                  Active filters: {filters.categories.join(', ')} {filters.subcategories.join(', ')}
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="flex overflow-x-auto gap-6 pb-4 md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-6 scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
                  {filteredProducts.map((product) => (
                    <div key={product._id} className="w-72 flex-shrink-0 md:w-auto">
                      <ProductCard product={product} onSelectProduct={onSelectProduct} />
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                <div className="flex justify-center items-center mt-12 space-x-2">
                  <button className="p-2 rounded-md hover:bg-gray-100">
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="w-8 h-8 rounded-md bg-primary text-white text-sm font-medium">
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
    </div>
  );
}