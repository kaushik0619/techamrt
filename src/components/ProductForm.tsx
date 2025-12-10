import { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, ChevronDown } from 'lucide-react';
import { api } from '../lib/api';

interface ProductFormProps {
  onClose: () => void;
  onSuccess: () => void;
  // optional: pass product data & id for edit mode
  initialProduct?: any;
  productId?: string;
}

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  subcategory: string;
  brand?: string;
  accessoryType?: string;
  // keep price for legacy; prefer originalPrice/salePrice for discounts
  price: number;
  originalPrice?: number;
  salePrice?: number;
  discountPercentage?: number;
  // Allow assigning to multiple categories (additional to primary `category`)
  categories?: string[];
  // optional server shape mirror - stored as array on server, managed locally as map
  categoriesDetails?: Array<{ category: string; subcategories?: string[] }>;
  stock: number;
  images: string[];
  specs: { [key: string]: string };
}

const categories = [
  { value: 'accessories', label: 'Accessories', subcategories: ['Phone', 'iPad', 'AirPods', 'Laptop'] },
  { value: 'spare_parts', label: 'Spare Parts', subcategories: ['Phone', 'iPad', 'AirPods', 'Laptop'] },
  { value: 'toys_games', label: 'Toys & Games', subcategories: [] },
  { value: 'car_accessories', label: 'Car Accessories', subcategories: [] },
  // New Home category with subcategories shown on Landing cards
  { value: 'home', label: 'Home', subcategories: ['Electronics', 'Car Accessories', 'Gadgets', 'Special Offers', 'Explore Deals', 'Best Sellers', 'AirPods Collection'] },
];

export function ProductForm({ onClose, onSuccess, initialProduct, productId }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    price: 0,
    originalPrice: undefined,
    salePrice: undefined,
    discountPercentage: undefined,
    categories: [],
    stock: 0,
    images: [],
    specs: {},
  });

  // populate when editing
  useEffect(() => {
    if (!initialProduct) return;
    try {
      const p: any = initialProduct;
      setFormData(prev => ({
        ...prev,
        name: p.name || prev.name,
        description: p.description || prev.description,
        category: p.category || prev.category,
        subcategory: p.subcategory || prev.subcategory,
        brand: p.brand || prev.brand,
        price: p.price ?? prev.price,
        originalPrice: p.originalPrice ?? p.price ?? prev.originalPrice,
        salePrice: p.salePrice ?? undefined,
        discountPercentage: p.discountPercentage ?? undefined,
        categories: (p.categories && Array.isArray(p.categories) ? p.categories : (p.categories ? [p.categories] : [])) || prev.categories,
        stock: p.stock ?? prev.stock,
        images: p.images || prev.images,
        specs: p.specs || prev.specs,
      }));
      // populate per-category subcategory selections if provided
      if (p.categoriesDetails && Array.isArray(p.categoriesDetails)) {
        const map: Record<string,string[]> = {};
        p.categoriesDetails.forEach((cd: any) => {
          if (cd && cd.category) map[cd.category] = Array.isArray(cd.subcategories) ? cd.subcategories : [];
        });
        setCategoriesDetailsMap(map);
      }
    } catch (e) {
      console.warn('Failed to populate product form for edit', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProduct]);
  
  const [imageInput, setImageInput] = useState('');
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [brandsList, setBrandsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandOpen, setBrandOpen] = useState(false);
  const brandRef = useRef<HTMLDivElement | null>(null);
  const [categoriesDetailsMap, setCategoriesDetailsMap] = useState<Record<string, string[]>>({});

  const selectedCategory = categories.find(cat => cat.value === formData.category);

  // Helper mapping for accessory UI: when UI subcategory is 'Phone', backend
  // category for products is 'Smartphones' in our seed. Map where necessary.
  const mapUiSubToApiCategory = (uiSub?: string) => {
    if (!uiSub) return undefined;
    if (uiSub.toLowerCase() === 'phone') return 'Smartphones';
    return uiSub;
  };

  // Load brands when category/subcategory change. If a subcategory is selected
  // (e.g. Phone) query the device category used in the DB (e.g. 'Smartphones').
  // This ensures Spare Parts -> Phone returns the same brands as Accessories -> Phone.
  const loadBrands = async () => {
    try {
      let apiCategory: string | undefined;

      // Prefer mapping from subcategory to the DB category (e.g. Phone -> Smartphones)
      if (formData.subcategory) {
        apiCategory = mapUiSubToApiCategory(formData.subcategory) || formData.subcategory;
      } else if (formData.category) {
        // Fallback to the selected category (e.g. 'Spare Parts' or 'accessories')
        apiCategory = formData.category === 'spare_parts' ? 'Spare Parts' : formData.category;
      }

      if (!apiCategory) {
        setBrandsList([]);
        return;
      }

      const resp = await api.get<any>('/api/products/brands', { params: { category: apiCategory } });
      const list: string[] = Array.isArray(resp) ? resp : resp?.data || resp?.brands || resp || [];
      // dedupe and set
      const dedup = Array.from(new Set(list.filter(Boolean)));
      setBrandsList(dedup);
    } catch (e) {
      console.error('Failed to load brands', e);
      setBrandsList([]);
    }
  };

  // watch category/subcategory changes to load brands
  useEffect(() => {
    loadBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.category, formData.subcategory]);

  // close brand dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (brandRef.current && !brandRef.current.contains(e.target as Node)) {
        setBrandOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || formData.price <= 0) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // If this is an accessory or spare parts product, map accessoryType to a sensible
      // subcategory value so the frontend Accessories page can filter them
      // into protective cases / tempered glass / other.
      let submitSubcategory = formData.subcategory || undefined;
      // Also map UI category/subcategory into the API/backend category
      // (e.g., UI 'accessories' + subcategory 'Phone' -> backend 'Smartphones')
      let submitCategory: string | undefined = formData.category || undefined;
      
      if (formData.category === 'accessories' && formData.accessoryType) {
        const mapTypeToSub: Record<string,string> = {
          'protective-cases': 'cases',
          'tempered-glass': 'tempered-glass',
          'other-accessories': 'other-accessories'
        };
        submitSubcategory = mapTypeToSub[formData.accessoryType] || formData.accessoryType;
      }

      if (formData.category === 'spare_parts' && formData.accessoryType) {
        const mapTypeToSub: Record<string,string> = {
          'battery': 'battery',
          'display': 'display',
          'charging-port': 'charging-port',
          'speaker': 'speaker',
          'camera': 'camera',
          'other-parts': 'other-parts'
        };
        submitSubcategory = mapTypeToSub[formData.accessoryType] || formData.accessoryType;
      }

      // If the product is an accessory for a specific device type (e.g. Phone),
      // map that UI subcategory to the backend category string used in the DB.
      if (formData.category === 'accessories' && formData.subcategory) {
        const mapped = mapUiSubToApiCategory(formData.subcategory);
        if (mapped) submitCategory = mapped;
      }

      // For spare_parts, keep category as "Spare Parts"
      if (formData.category === 'spare_parts') {
        submitCategory = 'Spare Parts';
      }

      // For home category, keep category as 'home' and store the chosen subcategory
      if (formData.category === 'home') {
        submitCategory = 'home';
        submitSubcategory = formData.subcategory || submitSubcategory;
      }

      const payload: any = {
        name: formData.name,
        description: formData.description,
        category: submitCategory || formData.category,
        subcategory: submitSubcategory || undefined,
        brand: formData.brand || undefined,
        // Pricing fields: send both original and sale if available
        originalPrice: formData.originalPrice ?? formData.price,
        salePrice: formData.salePrice,
        discountPercentage: formData.discountPercentage,
        // legacy price field: effective price for compatibility
        price: formData.salePrice ?? formData.originalPrice ?? formData.price,
        stock: formData.stock,
        images: formData.images,
        specs: Object.keys(formData.specs).length > 0 ? formData.specs : null,
      };
      // include categories array (unique, include primary category)
      const chosenPrimary = submitCategory || formData.category;
      const extras = (formData.categories || []).filter(Boolean);
      const categoriesSet = Array.from(new Set([...(chosenPrimary ? [chosenPrimary] : []), ...extras]));
      if (categoriesSet.length > 0) payload.categories = categoriesSet;
      // include per-category subcategory selections in payload if any
      try {
        const cdEntries = Object.entries(categoriesDetailsMap || {}).map(([category, subcategories]) => ({
          category,
          subcategories: Array.isArray(subcategories) && subcategories.length > 0 ? subcategories : undefined,
        }));
        if (cdEntries.length > 0) payload.categoriesDetails = cdEntries;
      } catch (e) {
        // ignore map errors
      }

      if (productId || (initialProduct && initialProduct._id)) {
        const idToUse = productId || initialProduct._id;
        await api.put(`/api/products/${idToUse}`, payload);
      } else {
        await api.post('/api/products', payload);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageInput.trim()]
      }));
      setImageInput('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addSpec = () => {
    if (specKey.trim() && specValue.trim()) {
      setFormData(prev => ({
        ...prev,
        specs: { ...prev.specs, [specKey.trim()]: specValue.trim() }
      }));
      setSpecKey('');
      setSpecValue('');
    }
  };

  const removeSpec = (key: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specs };
      delete newSpecs[key];
      return { ...prev, specs: newSpecs };
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{initialProduct || productId ? 'Edit Product' : 'Add New Product'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., iPhone 15 Pro Case"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detailed product description..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    category: e.target.value,
                    subcategory: '' 
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {selectedCategory && selectedCategory.subcategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select subcategory</option>
                    {selectedCategory.subcategories.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

              {/* Brand selector: visible when accessory category for phone or spare_parts (brands loaded dynamically) */}
              {(formData.category === 'accessories' || formData.category === 'spare_parts') && formData.subcategory && (
                <div ref={brandRef} className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <button
                    type="button"
                    onClick={() => setBrandOpen(open => !open)}
                    className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <span className={formData.brand ? 'text-gray-900' : 'text-gray-400'}>{formData.brand || 'Select brand (optional)'}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {brandOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                      <button
                        type="button"
                        onClick={() => { setFormData(prev => ({ ...prev, brand: '' })); setBrandOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                      >
                        Select brand (optional)
                      </button>
                      {brandsList.map(b => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => { setFormData(prev => ({ ...prev, brand: b })); setBrandOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Accessory type selector: appears after brand selected for accessories or spare_parts */}
              {formData.category === 'accessories' && formData.subcategory && formData.brand && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accessory Type</label>
                  <select
                    value={formData.accessoryType || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, accessoryType: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    <option value="protective-cases">Protective Cases</option>
                    <option value="tempered-glass">Tempered Glass</option>
                    <option value="other-accessories">Other Accessories</option>
                  </select>
                </div>
              )}

              {/* Spare parts type selector: appears after brand selected */}
              {formData.category === 'spare_parts' && formData.subcategory && formData.brand && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Spare Part Type</label>
                  <select
                    value={formData.accessoryType || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, accessoryType: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    <option value="battery">Battery</option>
                    <option value="display">Display/Screen</option>
                    <option value="charging-port">Charging Port</option>
                    <option value="speaker">Speaker</option>
                    <option value="camera">Camera</option>
                    <option value="other-parts">Other Parts</option>
                  </select>
                </div>
              )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price (₹) *
                </label>
                <input
                  type="number"
                  value={formData.originalPrice ?? formData.price}
                  onChange={(e) => {
                    const original = parseFloat(e.target.value) || 0;
                    setFormData(prev => {
                      const disc = prev.discountPercentage;
                      let sale = prev.salePrice;
                      if (disc !== undefined && !Number.isNaN(Number(disc))) {
                        sale = Math.max(0, +(original * (1 - Number(disc) / 100)).toFixed(2));
                      }
                      return { ...prev, originalPrice: original, price: sale ?? original, salePrice: sale };
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount %</label>
                    <input
                      type="number"
                      value={formData.discountPercentage ?? ''}
                      onChange={(e) => {
                        const disc = e.target.value === '' ? undefined : parseFloat(e.target.value);
                        setFormData(prev => {
                          const original = prev.originalPrice ?? prev.price ?? 0;
                          let sale = prev.salePrice;
                          if (disc !== undefined && !Number.isNaN(Number(disc))) {
                            sale = Math.max(0, +(original * (1 - Number(disc) / 100)).toFixed(2));
                          }
                          return { ...prev, discountPercentage: disc, salePrice: sale, price: sale ?? original };
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price (₹)</label>
                    <input
                      type="number"
                      value={formData.salePrice ?? ''}
                      onChange={(e) => {
                        const sale = e.target.value === '' ? undefined : parseFloat(e.target.value);
                        setFormData(prev => {
                          const original = prev.originalPrice ?? prev.price ?? 0;
                          let disc = prev.discountPercentage;
                          if (sale !== undefined && original > 0) {
                            disc = +((1 - sale / original) * 100).toFixed(2);
                          }
                          return { ...prev, salePrice: sale, discountPercentage: disc, price: sale ?? original };
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
            
            <div className="flex gap-2">
              <input
                type="url"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Additional Categories: allow assigning product to multiple categories and per-category subcategory selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Categories (optional)</label>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <div key={cat.value} className="inline-block">
                      <label className="inline-flex items-center gap-2 px-3 py-1 border border-gray-200 rounded-full cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={(formData.categories || []).includes(cat.value)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData(prev => {
                              const current = new Set(prev.categories || []);
                              if (checked) current.add(cat.value); else current.delete(cat.value);
                              return { ...prev, categories: Array.from(current) };
                            });
                            if (checked) {
                              setCategoriesDetailsMap(prev => ({ ...prev, [cat.value]: prev[cat.value] || [] }));
                            } else {
                              setCategoriesDetailsMap(prev => {
                                const copy = { ...prev };
                                delete copy[cat.value];
                                return copy;
                              });
                            }
                          }}
                          className="form-checkbox h-4 w-4"
                        />
                        <span className="text-sm">{cat.label}</span>
                      </label>

                      {/* show per-category subcategory selectors when this additional category is selected */}
                      {(formData.categories || []).includes(cat.value) && cat.subcategories && cat.subcategories.length > 0 && (
                        <div className="mt-2 ml-4 bg-gray-50 p-2 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">Select subcategories for {cat.label} (optional)</div>
                          <div className="flex flex-wrap gap-2">
                            {cat.subcategories.map(sub => (
                              <label key={sub} className="inline-flex items-center gap-2 px-2 py-1 border border-gray-200 rounded-full cursor-pointer select-none text-sm">
                                <input
                                  type="checkbox"
                                  checked={(categoriesDetailsMap[cat.value] || []).includes(sub)}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setCategoriesDetailsMap(prev => {
                                      const copy = { ...prev };
                                      const current = new Set(copy[cat.value] || []);
                                      if (checked) current.add(sub); else current.delete(sub);
                                      copy[cat.value] = Array.from(current);
                                      return copy;
                                    });
                                  }}
                                  className="form-checkbox h-4 w-4"
                                />
                                <span>{sub}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Specifications (Optional)</h3>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={specKey}
                onChange={(e) => setSpecKey(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Key (e.g., Color)"
              />
              <input
                type="text"
                value={specValue}
                onChange={(e) => setSpecValue(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Value (e.g., Black)"
              />
              <button
                type="button"
                onClick={addSpec}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {Object.keys(formData.specs).length > 0 && (
              <div className="space-y-2">
                {Object.entries(formData.specs).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
                    <span className="text-sm">
                      <span className="font-medium text-gray-700">{key}:</span>{' '}
                      <span className="text-gray-600">{value}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSpec(key)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (initialProduct || productId ? 'Saving...' : 'Creating...') : (initialProduct || productId ? 'Save Changes' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
