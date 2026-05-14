import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productService } from '../../services/productService'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { FiPlus, FiEdit, FiTrash2, FiPackage, FiSearch } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function VendorProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    productService.getVendorProducts()
      .then(r => setProducts(r.data.data || []))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    setDeleting(id)
    try {
      await productService.deleteProduct(id)
      setProducts(prev => prev.filter(p => p._id !== id))
      toast.success('Product deleted')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">My Products</h1>
        <Link to="/vendor/products/add" className="btn-primary flex items-center gap-2">
          <FiPlus /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="input-field pl-10" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <FiPackage className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="font-display font-semibold text-lg text-gray-900 dark:text-white mb-2">No products yet</h3>
          <p className="text-gray-500 mb-4">Add your first product to start selling</p>
          <Link to="/vendor/products/add" className="btn-primary inline-flex items-center gap-2">
            <FiPlus /> Add Product
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || `https://picsum.photos/seed/${p._id}/40/40`} alt="" className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">{p.title}</p>
                          <p className="text-xs text-gray-400">{formatDate(p.created_at)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">{p.category?.name || '-'}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-4">
                      <span className={`badge text-xs ${p.stock > 10 ? 'badge-green' : p.stock > 0 ? 'badge-yellow' : 'badge-red'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1.5">
                        <span className={`badge text-xs ${p.is_active ? 'badge-green' : 'badge-gray'}`}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`badge text-xs ${p.is_approved ? 'badge-blue' : 'badge-yellow'}`}>
                          {p.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/vendor/products/edit/${p._id}`} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                          <FiEdit className="text-sm" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p._id)}
                          disabled={deleting === p._id}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
