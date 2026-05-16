import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { orderService } from '../../services/orderService'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../../utils/helpers'
import EmptyState from '../../components/common/EmptyState'
import { FiEye } from 'react-icons/fi'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService.getOrders()
      .then(r => setOrders(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Helmet><title>My Orders — LocalMarket</title></Helmet>
      <div className="page-container py-8">
        <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-6">
          📦 My Orders
        </h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            type="orders"
            title="No orders yet"
            description="You haven't placed any orders yet. Start exploring local products from vendors near you!"
            action="/products"
            actionLabel="Start Shopping"
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5 hover:-translate-y-0.5 transition-transform duration-200"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{order.order_number}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${getStatusColor(order.status)} text-sm px-3 py-1`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <Link to={`/orders/${order._id}`} className="btn-outline text-sm py-1.5 px-4 flex items-center gap-1 hover:text-primary-600">
                      <FiEye className="text-xs" /> View
                    </Link>
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
                  {(order.items || []).slice(0, 4).map((item, j) => (
                    <div key={j} className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img src={item.image || `https://picsum.photos/seed/${item.product_id}/56/56`} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {(order.items || []).length > 4 && (
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm text-gray-500 font-medium">
                      +{(order.items || []).length - 4}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-500">{(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(order.total)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
