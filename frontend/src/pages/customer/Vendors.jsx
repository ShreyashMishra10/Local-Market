import { useEffect, useState } from 'react'
import { vendorService } from '../../services/vendorService'
import VendorCard from '../../components/vendor/VendorCard'
import { FiSearch, FiMapPin } from 'react-icons/fi'

const CATEGORIES = ['All', 'Groceries', 'Clothing', 'Electronics', 'Handicrafts', 'Food & Dining', 'Furniture', 'Beauty', 'Books']

export default function Vendors() {
  const [vendors, setVendors]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [city, setCity]         = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    const params = {}
    if (search)   params.search   = search
    if (city)     params.city     = city
    if (category !== 'All') params.category = category

    setLoading(true)
    vendorService.getVendors(params)
      .then(r => setVendors(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search, city, category])

  return (
    <div className="page-container py-8">
      <div className="mb-8">
        <h1 className="section-title mb-2">Local Vendors</h1>
        <p className="text-gray-500">Discover authentic local shops near you</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shops..." className="input-field pl-9 py-2 text-sm" />
        </div>
        <div className="relative">
          <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Filter by city..." className="input-field pl-9 py-2 text-sm w-40" />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
              ${category === cat ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300'}`}>
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🏪</div>
          <p className="text-gray-500 font-medium">No vendors found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vendors.map(v => <VendorCard key={v._id} vendor={v} />)}
        </div>
      )}
    </div>
  )
}
