import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { productService } from '../../services/productService';
import { ProductCard } from '../../components/ProductCard';

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Active filters
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = parseInt(searchParams.get('page') || '0', 10);

  // Local state for price inputs
  const [priceMinInput, setPriceMinInput] = useState(minPrice);
  const [priceMaxInput, setPriceMaxInput] = useState(maxPrice);

  useEffect(() => {
    productService.getCategories()
      .then((res) => setCategories(res || []))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getProducts({
          search: search || undefined,
          categoryId: categoryId || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          minRating: minRating || undefined,
          sortBy,
          page,
          size: 12,
        });

        setProducts(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [search, categoryId, minPrice, maxPrice, minRating, sortBy, page]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === undefined || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    newParams.set('page', '0'); // reset to first page on filter change
    setSearchParams(newParams);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (priceMinInput) newParams.set('minPrice', priceMinInput);
    else newParams.delete('minPrice');

    if (priceMaxInput) newParams.set('maxPrice', priceMaxInput);
    else newParams.delete('maxPrice');

    newParams.set('page', '0');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setPriceMinInput('');
    setPriceMaxInput('');
  };

  const hasActiveFilters = !!(search || categoryId || minPrice || maxPrice || minRating);

  return (
    <div className="container py-8">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            {search ? `Search Results for "${search}"` : 'Browse Products'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Showing {totalElements} {totalElements === 1 ? 'product' : 'products'} from verified sellers
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="md:hidden btn btn-outline btn-sm flex items-center gap-2"
          >
            <Filter size={16} />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => updateParam('sortBy', e.target.value)}
              className="form-select text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 bg-white"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid with Sidebar Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-6">
        {/* SIDEBAR FILTERS (Desktop) */}
        <aside className="hidden md:block md:col-span-3 space-y-6">
          <div className="card p-5 space-y-6 border border-slate-200 rounded-2xl bg-white sticky top-24">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal size={16} />
                <span>Filters</span>
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Category</h4>
              <div className="space-y-1 text-sm">
                <button
                  onClick={() => updateParam('categoryId', '')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    !categoryId ? 'bg-emerald-100 text-emerald-900' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateParam('categoryId', cat.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      categoryId === String(cat.id)
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Price Range (₹)</h4>
              <form onSubmit={handlePriceApply} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMinInput}
                    onChange={(e) => setPriceMinInput(e.target.value)}
                    className="form-input text-xs py-1.5 px-2"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMaxInput}
                    onChange={(e) => setPriceMaxInput(e.target.value)}
                    className="form-input text-xs py-1.5 px-2"
                  />
                </div>
                <button type="submit" className="btn btn-outline btn-sm w-full text-xs font-bold">
                  Apply Price
                </button>
              </form>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Minimum Rating</h4>
              <div className="space-y-1">
                {[4, 3, 2].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => updateParam('minRating', minRating === String(stars) ? '' : stars)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      minRating === String(stars)
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center text-amber-500 gap-1">
                      <Star size={14} fill="currentColor" />
                      <span>{stars} Stars & Above</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* PRODUCT LISTING GRID */}
        <main className="md:col-span-9 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card p-0 h-80 skeleton rounded-2xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="card p-12 text-center rounded-2xl border border-slate-200 space-y-4 max-w-lg mx-auto my-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Filter size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No products match your criteria</h3>
              <p className="text-sm text-slate-500">
                Try searching with different keywords, adjusting the price range, or clearing active filters.
              </p>
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="btn btn-primary btn-sm mx-auto">
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page === 0}
                onClick={() => updateParam('page', page - 1)}
                className="btn btn-outline btn-sm rounded-lg"
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => updateParam('page', i)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                      page === i
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={page >= totalPages - 1}
                onClick={() => updateParam('page', page + 1)}
                className="btn btn-outline btn-sm rounded-lg"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
