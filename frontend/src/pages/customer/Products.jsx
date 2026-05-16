import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { productService } from '../../services/productService'
import ProductCard from '../../components/product/ProductCard'
import ProductSkeleton from '../../components/product/ProductSkeleton'
import EmptyState from '../../components/common/EmptyState'
import { FiFilter, FiX, FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { debounce } from '../../utils/helpers'

const CATEGORIES = ['Groceries', 'Clothing', 'Electronics', 'Handicrafts', 'Food & Dining', 'Furniture', 'Beauty', 'Books']
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'popular',    label: 'Most Popular' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]         = useState([])
  const [page, setPage]                 = useState(1)
  const [hasMore, setHasMore]           = useState(true)
  const [loading, setLoading]           = useState(true)
  const [loadingMore, setLoadingMore]   = useState(false)
  const [total, setTotal]               = useState(0)
  const [filterOpen, setFilterOpen]     = useState(false)
  const [localSearch, setLocalSearch]   = useState(searchParams.get('search') || '')
  const loaderRef = useRef(null)

  const getParams = () => ({
    search:     searchParams.get('search') || undefined,
    category:   searchParams.get('category') || undefined,
    min_price:  searchParams.get('min_price') || undefined,
    max_price:  searchParams.get('max_price') || undefined,
    min_rating: searchParams.get('min_rating') || undefined,
    city:       searchParams.get('city') || undefined,
    sort:       searchParams.get('sort') || 'newest',
    featured:   searchParams.get('featured') || undefined,
    per_page:   12,
  })

  const loadProducts = async (pg = 1, reset = true) => {
    if (pg === 1) setLoading(true)
    else setLoadingMore(true)

    try {
      const res = await productService.getProducts({ ...getParams(), page: pg })
      const data = res.data
      const newItems = data.data || []

      if (reset || pg === 1) {
        setProducts(newItems)
      } else {
        setProducts(prev => [...prev, ...newItems])
      }

      setTotal(data.total || 0)
      setHasMore(data.current_page < data.last_page)
      setPage(pg)
    } catch {}
    finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    setPage(1)
    loadProducts(1, true)
    setLocalSearch(searchParams.get('search') || '')
  }, [searchParams.toString()])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadProducts(page + 1, false)
        }
      },
      { threshold: 0.1 }
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loading, page])

  const applyFilter = useCallback((key, value) => {
    const current = Object.fromEntries(searchParams.entries())
    if (value) current[key] = value
    else delete current[key]
    delete current.page
    setSearchParams(current)
  }, [searchParams, setSearchParams])

  const debouncedSearch = useCallback(
    debounce((val) => applyFilter('search', val), 400),
    [applyFilter]
  )

  const handleReset = () => {
    setSearchParams({})
    setLocalSearch('')
  }

  const activeFilters = ['category', 'min_price', 'max_price', 'city', 'min_rating']
    .filter(k => searchParams.get(k))

  return (
    <>
      <Helmet>
        <title>{searchParams.get('category') ? `${searchParams.get('category')} — LocalMarket` : 'All Products — LocalMarket'}</title>
      </Helmet>

      <div className="page-container py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Sidebar ── */}
          <AnimatePresence>
            {(filterOpen || true) && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`lg:w-64 flex-shrink-0 ${filterOpen ? 'block' : 'hidden lg:block'}`}
              >
                <div className="card p-5 sticky top-20 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-gray-900 dark:text-white">Filters</h3>
                    {activeFilters.length > 0 && (
                      <button onClick={handleReset} className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                        <FiX className="text-xs" /> Clear all ({activeFilters.length})
                      </button>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Category</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" name="cat" checked={!searchParams.get('category')} onChange={() => applyFilter('category', '')} className="text-primary-600" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-primary-600 transition-colors">All Categories</span>
                      </label>
                      {CATEGORIES.map(c => (
                        <label key={c} className="flex items-center gap-2 cursor-pointer group">
                          <input type="radio" name="cat" checked={searchParams.get('category') === c} onChange={() => applyFilter('category', c)} className="text-primary-600" />
                          <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-primary-600 transition-colors">{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Price Range (₹)</h4>
                    <div className="flex gap-2">
                      <input type="number" min="0" placeholder="Min" value={searchParams.get('min_price') || ''} onChange={e => applyFilter('min_price', e.target.value)} className="input-field text-sm py-2 px-3" />
                      <input type="number" min="0" placeholder="Max" value={searchParams.get('max_price') || ''} onChange={e => applyFilter('max_price', e.target.value)} className="input-field text-sm py-2 px-3" />
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Min Rating</h4>
                    {[4, 3, 2].map(r => (
                      <label key={r} className="flex items-center gap-2 cursor-pointer mb-2 group">
                        <input type="radio" name="rating" checked={searchParams.get('min_rating') === String(r)} onChange={() => applyFilter('min_rating', String(r))} className="text-primary-600" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 group-hover:text-primary-600 transition-colors">
                          {'⭐'.repeat(r)} & above
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* City */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">City</h4>
                    <input type="text" placeholder="Enter city..." value={searchParams.get('city') || ''} onChange={e => applyFilter('city', e.target.value)} className="input-field text-sm py-2" />
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* ── Products ── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button onClick={() => setFilterOpen(!filterOpen)} className="lg:hidden btn-outline flex items-center gap-2 text-sm py-2">
                  <FiFilter /> Filters {activeFilters.length > 0 && <span className="badge badge-red text-[10px] px-1.5">{activeFilters.length}</span>}
                </button>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    value={localSearch}
                    onChange={e => { setLocalSearch(e.target.value); debouncedSearch(e.target.value) }}
                    placeholder="Search products..."
                    className="input-field pl-9 py-2 text-sm w-48 md:w-64"
                  />
                </div>
                {!loading && <span className="text-sm text-gray-500">{total} products</span>}
              </div>

              <select value={searchParams.get('sort') || 'newest'} onChange={e => applyFilter('sort', e.target.value)} className="input-field py-2 text-sm w-auto">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Active Filters */}
            <AnimatePresence>
              {activeFilters.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-2 mb-4"
                >
                  {activeFilters.map(k => (
                    <span key={k} className="badge badge-blue flex items-center gap-1 px-3 py-1.5">
                      {k}: {searchParams.get(k)}
                      <button onClick={() => applyFilter(k, '')} className="ml-1 hover:text-red-500 transition-colors">
                        <FiX className="text-xs" />
                      </button>
                    </span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grid */}
            {loading ? (
              <ProductSkeleton count={12} />
            ) : products.length === 0 ? (
              <EmptyState
                type="search"
                title="No products found"
                description="Try adjusting your search or filters. We're adding new local products every day!"
                action="/products"
                actionLabel="Clear Filters"
              />
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {products.map((p, i) => (
                      <motion.div
                        key={p._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i < 12 ? i * 0.03 : 0 }}
                      >
                        <ProductCard product={p} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Infinite scroll sentinel */}
                <div ref={loaderRef} className="mt-8 flex justify-center">
                  {loadingMore && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                      Loading more products...
                    </div>
                  )}
                  {!hasMore && products.length > 0 && (
                    <p className="text-sm text-gray-400">🎉 You've seen all {total} products!</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
