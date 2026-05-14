import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../../utils/helpers'
import { FiSearch } from 'react-icons/fi'

export default function AdminOrders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus]   = useState('')

  useEffect(() => {
    setLoading(true)
    adminService.getOrders(status ? { status } : {})
      .then(r => setOrders(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status])

  const statuses = ['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

  return (
    <div className="space-y-5">
      <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Order Management</h1>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {statuses.map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-all
              ${status === s ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {['Order #', 'Items', 'Total', 'Payment', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.map(o => (
                  <tr key={o._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">{o.order_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{(o.items || []).length} items</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${o.payment_status === 'paid' ? 'badge-green' : 'badge-yellow'}`}>{o.payment_method?.toUpperCase()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${getStatusColor(o.status)}`}>{getStatusLabel(o.status)}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(o.created_at)}</td>
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
