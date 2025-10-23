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
                           filters.maxPrice < 10000;

  return (
    <aside className="w-full lg:w-1/4 lg:pr-8">
      <div className="space-y-6 p-4 border border-neutral-200 rounded-xl sticky top-24">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-neutral-800">Filters</h3>
          {hasActiveFilters && (
            <button 
              onClick={onClearFilters}
              className="text-xs text-primary-DEFAULT hover:text-primary-hover flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear All
            </button>
          )}
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-semibold text-neutral-800 mb-3">Category</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category.value} className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-neutral-300 text-primary-DEFAULT focus:ring-primary-DEFAULT cursor-pointer"
                  checked={filters.categories.includes(category.value)}
                  onChange={() => handleCategoryChange(category.value)}
                />
                <span className="ml-3 text-sm text-neutral-600">{category.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Subcategories */}
        <div className="border-t border-neutral-200 pt-6">
          <h3 className="font-semibold text-neutral-800 mb-3">Product Type</h3>
          <div className="space-y-2">
            {subcategories.map((subcategory) => (
              <label key={subcategory.value} className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-neutral-300 text-primary-DEFAULT focus:ring-primary-DEFAULT cursor-pointer"
                  checked={filters.subcategories.includes(subcategory.value)}
                  onChange={() => handleSubcategoryChange(subcategory.value)}
                />
                <span className="ml-3 text-sm text-neutral-600">{subcategory.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="border-t border-neutral-200 pt-6">
          <h3 className="font-semibold text-neutral-800 mb-4">Price Range</h3>
          <input
            type="range"
            min="10"
            max="10000"
            value={priceRange}
            onChange={(e) => handlePriceChange(Number(e.target.value))}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-DEFAULT"
          />
          <div className="flex justify-between text-sm text-neutral-500 mt-2">
            <span>₹{filters.minPrice}</span>
            <span>₹{priceRange}</span>
          </div>
        </div>

        {/* Brands */}
        <div className="border-t border-neutral-200 pt-6">
          <h3 className="font-semibold text-neutral-800 mb-3">Brand</h3>
          <div className="space-y-2">
            {brands.map((brand) => (
              <label key={brand.value} className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-neutral-300 text-primary-DEFAULT focus:ring-primary-DEFAULT cursor-pointer"
                  checked={filters.brands.includes(brand.value)}
                  onChange={() => handleBrandChange(brand.value)}
                />
                <span className="ml-3 text-sm text-neutral-600">{brand.label}</span>
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
    className="bg-white border border-neutral-200 rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
  >
    <div className="relative h-56 bg-neutral-100">
      <img
        src={product.images[0] || 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg'}
        alt={product.name}
        className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
      />
    </div>
    <div className="p-4">
      <div className="text-xs text-primary-DEFAULT font-semibold mb-1 uppercase">
        {product.category.replace('_', ' ')}
      </div>
      <h3 className="text-base font-semibold text-neutral-800 truncate group-hover:text-primary-DEFAULT">{product.name}</h3>
      <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{product.description}</p>
      <div className="flex items-center justify-between mt-4">
        <p className="text-lg font-bold text-neutral-900">₹{product.price.toFixed(2)}</p>
        <div className="flex items-center">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-xs text-neutral-500 ml-1">(4.8)</span>
        </div>
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
    maxPrice: 10000,
    brands: [],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);
      const response: ProductsResponse = await api.get('/products');
      setProducts(response.products);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...products];

    // Filter by categories
    if (filters.categories.length > 0) {
      filtered = filtered.filter(product => 
        filters.categories.includes(product.category)
      );
    }

    // Filter by subcategories (you might need to add a subcategory field to your product schema)
    // For now, we'll check if the product name or description contains the subcategory
    if (filters.subcategories.length > 0) {
      filtered = filtered.filter(product => 
        filters.subcategories.some(sub => 
          product.name.toLowerCase().includes(sub) || 
          product.description.toLowerCase().includes(sub)
        )
      );
    }

    // Filter by price
    filtered = filtered.filter(product => 
      product.price >= filters.minPrice && product.price <= filters.maxPrice
    );

    // Filter by brands (if you have brand data)
    // This is a placeholder - you'll need to add brand field to your product schema
    if (filters.brands.length > 0) {
      // filtered = filtered.filter(product => filters.brands.includes(product.brand));
    }

    setFilteredProducts(filtered);
  }

  function handleFilterChange(filterType: keyof Filters, value: any) {
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
      maxPrice: 10000,
      brands: [],
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-DEFAULT"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={loadProducts}
          className="px-4 py-2 bg-primary-DEFAULT text-white rounded hover:bg-primary-hover"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Products</h1>
          <p className="text-neutral-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row">
          <FilterSidebar 
            filters={filters} 
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
          
          <main className="w-full lg:w-3/4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-neutral-600 text-lg mb-4">No products found matching your filters</p>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2 bg-primary-DEFAULT text-white rounded-lg hover:bg-primary-hover"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} onSelectProduct={onSelectProduct} />
                  ))}
                </div>
                
                {/* Pagination */}
                <div className="flex justify-center items-center mt-12 space-x-2">
                  <button className="p-2 rounded-md hover:bg-neutral-100">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button className="w-8 h-8 rounded-md bg-primary-DEFAULT text-white text-sm font-medium">
                    1
                  </button>
                  <button className="w-8 h-8 rounded-md hover:bg-neutral-100 text-sm font-medium">
                    2
                  </button>
                  <button className="w-8 h-8 rounded-md hover:bg-neutral-100 text-sm font-medium">
                    3
                  </button>
                  <button className="p-2 rounded-md hover:bg-neutral-100">
                    <ChevronRight className="w-5 h-5" />
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