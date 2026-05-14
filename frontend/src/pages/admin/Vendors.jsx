import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import { formatDate } from '../../utils/helpers'
import { FiCheck, FiX, FiSearch } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function AdminVendors() {
  const [vendors, setVendors]  = useState([])
  const [loading, setLoading]  = useState(true)
  const [filter, setFilter]    = useState('all')
  const [search, setSearch]    = useState('')

  const load = () => {
    setLoading(true)
    const params = {}
    if (filter !== 'all') params.approved = filter === 'approved' ? 1 : 0
    if (search) params.search = search
    adminService.getVendors(params)
      .then(r => setVendors(r.data.data || []))
      .catch(() => toast.error('Failed to load vendors'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter, search])

  const handleApprove = async (id) => {
    try {
      await adminService.approveVendor(id)
      load()
      toast.success('Vendor approved!')
    } catch { toast.error('Failed') }
  }

  const handleReject = async (id) => {
    if (!window.confirm('Reject this vendor?')) return
    try {
      await adminService.rejectVendor(id)
      load()
      toast.success('Vendor rejected')
    } catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Vendor Management</h1>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors..." className="input-field pl-9 py-2 text-sm" />
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
        ) : vendors.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No vendors found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {['Shop', 'Category', 'City', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {vendors.map(v => (
                  <tr key={v._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{v.shop_name}</p>
                      <p className="text-xs text-gray-400">{v.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{v.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{v.city}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(v.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${v.is_approved ? 'badge-green' : 'badge-yellow'}`}>
                        {v.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        {!v.is_approved && (
                          <button onClick={() => handleApprove(v._id)} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg" title="Approve">
                            <FiCheck className="text-sm" />
                          </button>
                        )}
                        <button onClick={() => handleReject(v._id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Reject">
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
