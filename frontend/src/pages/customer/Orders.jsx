import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { orderService } from '../../services/orderService'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../../utils/helpers'
import { FiPackage, FiEye } from 'react-icons/fi'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService.getOrders()
      .then(r => setOrders(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="page-container py-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-5 mb-4 space-y-3">
            <div className="skeleton h-5 w-40 rounded" />
            <div className="skeleton h-4 w-24 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="page-container py-20 text-center">
        <div className="text-8xl mb-6">📦</div>
        <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-3">No orders yet</h2>
        <p className="text-gray-500 mb-8">Start shopping to see your orders here</p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          <FiPackage /> Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="page-container py-8">
      <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-6">My Orders</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <div key={order._id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{order.order_number}</p>
                <p className="text-sm text-gray-500 mt-0.5">{formatDate(order.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${getStatusColor(order.status)} text-sm px-3 py-1`}>
                  {getStatusLabel(order.status)}
                </span>
                <Link to={`/orders/${order._id}`} className="btn-outline text-sm py-1.5 px-4 flex items-center gap-1">
                  <FiEye className="text-xs" /> View
                </Link>
              </div>
            </div>

            {/* Items preview */}
            <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
              {(order.items || []).slice(0, 4).map((item, i) => (
                <div key={i} className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img src={item.image || `https://picsum.photos/seed/${item.product_id}/56/56`} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              {(order.items || []).length > 4 && (
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm text-gray-500">
                  +{(order.items || []).length - 4}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-500">{(order.items || []).length} items</span>
              <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(order.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
