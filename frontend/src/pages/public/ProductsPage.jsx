import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  SlidersHorizontal,
  Star,
  ChevronLeft,
  ChevronRight,
  Search,
  X
} from 'lucide-react';
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

  // ============================================================
  // URL FILTERS
  // ============================================================

  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = parseInt(searchParams.get('page') || '0', 10);

  // ============================================================
  // LOCAL PRICE INPUTS
  // ============================================================

  const [priceMinInput, setPriceMinInput] = useState(minPrice);
  const [priceMaxInput, setPriceMaxInput] = useState(maxPrice);

  // ============================================================
  // LOAD CATEGORIES
  // ============================================================

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await productService.getCategories();
        setCategories(res || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    fetchCategories();
  }, []);

  // ============================================================
  // KEEP PRICE INPUTS IN SYNC WITH URL
  // ============================================================

  useEffect(() => {
    setPriceMinInput(minPrice);
    setPriceMaxInput(maxPrice);
  }, [minPrice, maxPrice]);

  // ============================================================
  // LOAD PRODUCTS
  // ============================================================

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

        setProducts(data?.content || []);
        setTotalPages(data?.totalPages || 0);
        setTotalElements(data?.totalElements || 0);
      } catch (err) {
        console.error('Failed to load products:', err);

        setProducts([]);
        setTotalPages(0);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [
    search,
    categoryId,
    minPrice,
    maxPrice,
    minRating,
    sortBy,
    page
  ]);

  // ============================================================
  // UPDATE URL PARAMETER
  // ============================================================

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
    }

    // Reset pagination whenever a filter changes
    if (key !== 'page') {
      newParams.set('page', '0');
    }

    setSearchParams(newParams);
  };

  // ============================================================
  // PRICE FILTER
  // ============================================================

  const handlePriceApply = (e) => {
    e.preventDefault();

    const newParams = new URLSearchParams(searchParams);

    if (priceMinInput) {
      newParams.set('minPrice', priceMinInput);
    } else {
      newParams.delete('minPrice');
    }

    if (priceMaxInput) {
      newParams.set('maxPrice', priceMaxInput);
    } else {
      newParams.delete('maxPrice');
    }

    newParams.set('page', '0');

    setSearchParams(newParams);
    setMobileFiltersOpen(false);
  };

  // ============================================================
  // CLEAR ALL FILTERS
  // ============================================================

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setPriceMinInput('');
    setPriceMaxInput('');
    setMobileFiltersOpen(false);
  };

  // ============================================================
  // ACTIVE FILTER CHECK
  // ============================================================

  const hasActiveFilters = Boolean(
    search ||
    categoryId ||
    minPrice ||
    maxPrice ||
    minRating
  );

  // ============================================================
  // FILTER CONTENT
  // ============================================================

  const FilterContent = () => (
    <div className="space-y-6">

      {/* CATEGORY */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Category
        </h4>

        <div className="space-y-1">
          <button
            onClick={() => updateParam('categoryId', '')}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition ${!categoryId
              ? 'bg-emerald-100 text-emerald-900'
              : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            All Categories
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                updateParam('categoryId', cat.id)
              }
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition ${categoryId === String(cat.id)
                ? 'bg-emerald-100 text-emerald-900'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* PRICE */}
      <div className="border-t border-slate-100 pt-5 space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Price Range (₹)
        </h4>

        <form
          onSubmit={handlePriceApply}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={priceMinInput}
              onChange={(e) =>
                setPriceMinInput(e.target.value)
              }
              className="form-input text-sm py-2 px-3 rounded-xl"
            />

            <input
              type="number"
              min="0"
              placeholder="Max"
              value={priceMaxInput}
              onChange={(e) =>
                setPriceMaxInput(e.target.value)
              }
              className="form-input text-sm py-2 px-3 rounded-xl"
            />
          </div>

          <button
            type="submit"
            className="btn btn-outline btn-sm w-full font-bold rounded-xl"
          >
            Apply Price
          </button>
        </form>
      </div>

      {/* RATING */}
      <div className="border-t border-slate-100 pt-5 space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Minimum Rating
        </h4>

        <div className="space-y-1">
          {[4, 3, 2].map((stars) => (
            <button
              key={stars}
              onClick={() =>
                updateParam(
                  'minRating',
                  minRating === String(stars)
                    ? ''
                    : stars
                )
              }
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition ${minRating === String(stars)
                ? 'bg-emerald-100 text-emerald-900'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <div className="flex items-center gap-2 text-amber-500">
                <Star
                  size={15}
                  fill="currentColor"
                />

                <span>
                  {stars} Stars & Above
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <section className="container pt-8 sm:pt-10">

        <div className="text-center">

          {/* Small Label */}
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-[0.18em] mb-3">
            <span className="w-5 h-px bg-emerald-500"></span>

            <span>Marketplace</span>

            <span className="w-5 h-px bg-emerald-500"></span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            {search
              ? `Search Results for "${search}"`
              : 'Browse Products'}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-500 mt-3">
            Discover products from our verified sellers
          </p>

          {/* Search Result */}
          <div className="mt-4 text-sm text-slate-500">
            Showing{' '}
            <span className="font-bold text-slate-900">
              {totalElements}
            </span>{' '}
            {totalElements === 1
              ? 'product'
              : 'products'}
          </div>
        </div>

        {/* ==================================================
            TOP TOOLBAR
        =================================================== */}

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">

          {/* Mobile Filter */}
          <button
            onClick={() =>
              setMobileFiltersOpen(
                !mobileFiltersOpen
              )
            }
            className="md:hidden btn btn-outline btn-sm rounded-xl flex items-center gap-2"
          >
            <Filter size={16} />
            Filters
          </button>

          {/* Sort */}
          <div className="flex items-center gap-2">

            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sort
            </span>

            <select
              value={sortBy}
              onChange={(e) =>
                updateParam(
                  'sortBy',
                  e.target.value
                )
              }
              className="form-select text-sm font-semibold py-2.5 px-4 rounded-xl border border-slate-200 bg-white shadow-sm min-w-[190px]"
            >
              <option value="newest">
                Newest Arrivals
              </option>

              <option value="priceAsc">
                Price: Low to High
              </option>

              <option value="priceDesc">
                Price: High to Low
              </option>

              <option value="rating">
                Highest Rated
              </option>

              <option value="popular">
                Most Popular
              </option>
            </select>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 border-b border-slate-200"></div>
      </section>

      {/* ======================================================
          MOBILE FILTER PANEL
      ======================================================= */}

      {mobileFiltersOpen && (
        <div className="md:hidden container pt-5">

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">

            <div className="flex items-center justify-between mb-5">

              <div className="flex items-center gap-2">
                <SlidersHorizontal
                  size={18}
                  className="text-emerald-600"
                />

                <h3 className="font-bold text-slate-900">
                  Filters
                </h3>
              </div>

              <button
                onClick={() =>
                  setMobileFiltersOpen(false)
                }
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <FilterContent />

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-5 w-full text-sm font-bold text-red-600 hover:text-red-700"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* ======================================================
          MAIN CONTENT
          FULL WIDTH - NO SIDEBAR SPACE
      ======================================================= */}

      <section className="container py-8">

        {/* Desktop Filter Button + Active Filters */}
        <div className="hidden md:flex items-center justify-between mb-6">

          <div className="flex items-center gap-2">

            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600">
              <SlidersHorizontal
                size={15}
                className="text-emerald-600"
              />

              Filters
            </div>

            {categoryId && (
              <span className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold">
                Category selected
              </span>
            )}

            {minRating && (
              <span className="px-3 py-2 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold">
                {minRating}+ Rating
              </span>
            )}

            {(minPrice || maxPrice) && (
              <span className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold">
                Price filtered
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-red-600 hover:text-red-700"
            >
              Reset All
            </button>
          )}
        </div>

        {/* ==================================================
            PRODUCTS
            EXACTLY 3 PER ROW ON DESKTOP
        =================================================== */}

        {loading ? (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[470px] bg-white border border-slate-200 rounded-3xl skeleton"
              />
            ))}

          </div>

        ) : products.length === 0 ? (

          /* =================================================
             EMPTY STATE
          ================================================== */

          <div className="max-w-xl mx-auto">

            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">

              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-5">
                <Search size={28} />
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                No products found
              </h3>

              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                Try changing your search, category,
                price range, or rating filters.
              </p>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="btn btn-primary btn-sm mt-6 rounded-xl"
                >
                  Reset All Filters
                </button>
              )}

            </div>
          </div>

        ) : (

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-x-6
              gap-y-8
              w-full
            "
          >

            {products.map((product) => (

              <div
                key={product.id}
                className="w-full min-w-0"
              >
                <ProductCard
                  product={product}
                />
              </div>

            ))}

          </div>
        )}

        {/* ==================================================
            PAGINATION
        =================================================== */}

        {totalPages > 1 && (

          <div className="flex items-center justify-center mt-12">

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">

              {/* Previous */}
              <button
                disabled={page === 0}
                onClick={() =>
                  updateParam(
                    'page',
                    page - 1
                  )
                }
                className="h-9 px-3 rounded-xl flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
                Prev
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">

                {Array.from(
                  { length: totalPages },
                  (_, i) => i
                ).map((i) => (

                  <button
                    key={i}
                    onClick={() =>
                      updateParam(
                        'page',
                        i
                      )
                    }
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition ${page === i
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    {i + 1}
                  </button>

                ))}

              </div>

              {/* Next */}
              <button
                disabled={
                  page >= totalPages - 1
                }
                onClick={() =>
                  updateParam(
                    'page',
                    page + 1
                  )
                }
                className="h-9 px-3 rounded-xl flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
                <ChevronRight size={16} />
              </button>

            </div>
          </div>
        )}
      </section>
    </div>
  );
};