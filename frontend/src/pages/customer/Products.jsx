import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts, setFilters, resetFilters } from '../../store/productSlice'
import ProductCard from '../../components/product/ProductCard'
import ProductSkeleton from '../../components/product/ProductSkeleton'
import { FiFilter, FiX, FiChevronDown, FiSearch } from 'react-icons/fi'
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
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { products, pagination, loading, filters } = useSelector(s => s.product)
  const [filterOpen, setFilterOpen] = useState(false)
  const [localSearch, setLocalSearch] = useState(searchParams.get('search') || '')

  useEffect(() => {
    const params = {}
    searchParams.forEach((v, k) => { params[k] = v })
    dispatch(setFilters(params))
    dispatch(fetchProducts(params))
  }, [searchParams, dispatch])

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

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value)
    debouncedSearch(e.target.value)
  }

  const handlePageChange = (page) => {
    const current = Object.fromEntries(searchParams.entries())
    current.page = page
    setSearchParams(current)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleReset = () => {
    dispatch(resetFilters())
    setSearchParams({})
    setLocalSearch('')
  }

  const activeFilters = ['category', 'min_price', 'max_price', 'city', 'min_rating']
    .filter(k => searchParams.get(k))

  return (
    <div className="page-container py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className={`
          lg:w-64 flex-shrink-0
          ${filterOpen ? 'block' : 'hidden lg:block'}
        `}>
          <div className="card p-5 sticky top-20 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-gray-900 dark:text-white">Filters</h3>
              {activeFilters.length > 0 && (
                <button onClick={handleReset} className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                  <FiX className="text-xs" /> Clear all
                </button>
              )}
            </div>

            {/* Category */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Category</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="cat" checked={!searchParams.get('category')} onChange={() => applyFilter('category', '')} className="text-primary-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">All Categories</span>
                </label>
                {CATEGORIES.map(c => (
                  <label key={c} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="cat" checked={searchParams.get('category') === c} onChange={() => applyFilter('category', c)} className="text-primary-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{c}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Price Range (₹)</h4>
              <div className="flex gap-2">
                <input
                  type="number" min="0"
                  placeholder="Min"
                  value={searchParams.get('min_price') || ''}
                  onChange={e => applyFilter('min_price', e.target.value)}
                  className="input-field text-sm py-2 px-3"
                />
                <input
                  type="number" min="0"
                  placeholder="Max"
                  value={searchParams.get('max_price') || ''}
                  onChange={e => applyFilter('max_price', e.target.value)}
                  className="input-field text-sm py-2 px-3"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Min Rating</h4>
              {[4, 3, 2, 1].map(r => (
                <label key={r} className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="radio" name="rating" checked={searchParams.get('min_rating') === String(r)} onChange={() => applyFilter('min_rating', String(r))} className="text-primary-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                    {'★'.repeat(r)} & above
                  </span>
                </label>
              ))}
            </div>

            {/* City */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">City</h4>
              <input
                type="text"
                placeholder="Enter city..."
                value={searchParams.get('city') || ''}
                onChange={e => applyFilter('city', e.target.value)}
                className="input-field text-sm py-2"
              />
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="lg:hidden btn-outline flex items-center gap-2 text-sm py-2"
              >
                <FiFilter /> Filters {activeFilters.length > 0 && <span className="badge badge-red">{activeFilters.length}</span>}
              </button>

              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={handleSearchChange}
                  placeholder="Search products..."
                  className="input-field pl-9 py-2 text-sm w-48 md:w-64"
                />
              </div>

              {pagination && (
                <span className="text-sm text-gray-500 hidden sm:block">
                  {pagination.total} products
                </span>
              )}
            </div>

            <select
              value={searchParams.get('sort') || 'newest'}
              onChange={e => applyFilter('sort', e.target.value)}
              className="input-field py-2 text-sm w-auto"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeFilters.map(k => (
                <span key={k} className="badge badge-blue flex items-center gap-1 px-3 py-1.5">
                  {k}: {searchParams.get(k)}
                  <button onClick={() => applyFilter(k, '')} className="ml-1 hover:text-red-500">
                    <FiX className="text-xs" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <ProductSkeleton count={12} />
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
              <button onClick={handleReset} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all
                        ${pagination.current_page === page
                          ? 'bg-primary-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
