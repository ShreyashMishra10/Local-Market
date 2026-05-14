import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { FiCheck, FiX, FiStar, FiSearch } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [search, setSearch]     = useState('')

  const load = () => {
    setLoading(true)
    const params = {}
    if (filter !== 'all') params.approved = filter === 'approved' ? 1 : 0
    if (search) params.search = search
    adminService.getProducts(params)
      .then(r => setProducts(r.data.data || []))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter, search])

  return (
    <div className="space-y-5">
      <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Product Moderation</h1>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="input-field pl-9 py-2 text-sm" />
        </div>
        <div className="flex gap-1">
          {[['all', 'All'], ['pending', 'Pending'], ['approved', 'Approved']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${filter === v ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {['Product', 'Vendor', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {products.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || `https://picsum.photos/seed/${p._id}/40/40`} className="w-10 h-10 rounded-xl object-cover" alt="" />
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1 max-w-48">{p.title}</p>
                          <p className="text-xs text-gray-400">{formatDate(p.created_at)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.vendor?.shop_name || '-'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.stock}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <span className={`badge text-xs ${p.is_approved ? 'badge-green' : 'badge-yellow'}`}>{p.is_approved ? 'Approved' : 'Pending'}</span>
                        {p.is_featured && <span className="badge badge-yellow text-xs">Featured</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {!p.is_approved && (
                          <button onClick={async () => { await adminService.approveProduct(p._id); load(); toast.success('Approved') }} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg" title="Approve">
                            <FiCheck className="text-sm" />
                          </button>
                        )}
                        <button onClick={async () => { await adminService.featureProduct(p._id); load(); toast.success('Toggled featured') }} className="p-1.5 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg" title="Toggle Featured">
                          <FiStar className="text-sm" />
                        </button>
                        <button onClick={async () => { if (!window.confirm('Remove this product?')) return; await adminService.rejectProduct(p._id); load(); toast.success('Removed') }} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Remove">
                          <FiX className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
