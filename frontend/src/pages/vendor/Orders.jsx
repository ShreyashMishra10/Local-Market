import { useEffect, useState } from 'react'
import { orderService } from '../../services/orderService'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../../utils/helpers'
import { FiShoppingBag } from 'react-icons/fi'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

export default function VendorOrders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('')
  const [updating, setUpdating] = useState(null)

  const loadOrders = () => {
    setLoading(true)
    orderService.getVendorOrders(filter ? { status: filter } : {})
      .then(r => setOrders(r.data.data || []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadOrders() }, [filter])

  const handleStatusUpdate = async (orderId, status) => {
    setUpdating(orderId)
    try {
      await orderService.updateOrderStatus(orderId, { status })
      loadOrders()
      toast.success(`Order status updated to ${status}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Orders</h1>
        <div className="flex gap-2 overflow-x-auto">
          {['', ...STATUS_OPTIONS].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all capitalize
                ${filter === s ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center">
          <FiShoppingBag className="text-5xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{order.order_number}</p>
                  <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${getStatusColor(order.status)} text-sm`}>{getStatusLabel(order.status)}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(order.total)}</span>
                </div>
              </div>

              {/* Items */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex-shrink-0 flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <img src={item.image || `https://picsum.photos/seed/${item.product_id}/40/40`} className="w-8 h-8 rounded-lg object-cover" alt="" />
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-white whitespace-nowrap">{item.title}</p>
                      <p className="text-xs text-gray-400">x{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Update */}
              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                <div className="flex gap-2 flex-wrap">
                  <span className="text-sm text-gray-500 self-center">Update to:</span>
                  {STATUS_OPTIONS.filter(s => s !== order.status && s !== 'pending').map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusUpdate(order._id, s)}
                      disabled={updating === order._id}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize border
                        ${s === 'cancelled' ? 'border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
                    >
                      {updating === order._id ? '...' : s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
