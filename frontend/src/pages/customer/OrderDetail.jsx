import { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { orderService } from '../../services/orderService'
import { formatCurrency, formatDate, formatDateTime, getStatusColor, getStatusLabel } from '../../utils/helpers'
import { FiPackage, FiMapPin, FiCheckCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function OrderDetail() {
  const { id }    = useParams()
  const location  = useLocation()
  const [order, setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  const showSuccess = location.state?.success

  useEffect(() => {
    orderService.getOrder(id)
      .then(r => setOrder(r.data))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    setCancelling(true)
    try {
      await orderService.cancelOrder(id, { reason: 'Customer cancelled' })
      const r = await orderService.getOrder(id)
      setOrder(r.data)
      toast.success('Order cancelled')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot cancel order')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <div className="page-container py-8"><div className="skeleton h-96 rounded-2xl" /></div>
  if (!order) return <div className="page-container py-20 text-center text-gray-500">Order not found</div>

  const statusSteps = ['pending', 'confirmed', 'shipped', 'delivered']
  const currentStep = statusSteps.indexOf(order.status)

  return (
    <div className="page-container py-8">
      {showSuccess && (
        <div className="card p-5 mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 flex items-center gap-4">
          <FiCheckCircle className="text-4xl text-green-500 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-green-800 dark:text-green-300">Order Placed Successfully!</h3>
            <p className="text-sm text-green-600 dark:text-green-400">Your order #{order.order_number} is confirmed.</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">{order.order_number}</h1>
          <p className="text-gray-500 text-sm">Placed on {formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`badge ${getStatusColor(order.status)} text-sm px-4 py-2`}>{getStatusLabel(order.status)}</span>
          {['pending', 'confirmed'].includes(order.status) && (
            <button onClick={handleCancel} disabled={cancelling} className="btn-outline text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm py-1.5">
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          {order.status !== 'cancelled' && (
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Order Status</h3>
              <div className="flex items-center">
                {statusSteps.map((s, i) => (
                  <div key={s} className="flex-1 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-all
                      ${currentStep >= i ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                      {currentStep > i ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs text-center capitalize ${currentStep >= i ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>{s}</span>
                    {i < statusSteps.length - 1 && (
                      <div className="absolute" style={{ display: 'none' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Items</h3>
            <div className="space-y-4">
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                  <img src={item.image || `https://picsum.photos/seed/${item.product_id}/60/60`} className="w-16 h-16 rounded-xl object-cover" alt="" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Price Summary */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Price Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>}
              <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{order.shipping_fee === 0 ? 'FREE' : formatCurrency(order.shipping_fee)}</span></div>
              <div className="border-t pt-2 flex justify-between font-bold text-base text-gray-900 dark:text-white">
                <span>Total</span><span>{formatCurrency(order.total)}</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-xs text-gray-500">Payment: <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{order.payment_method}</span></p>
              <p className="text-xs text-gray-500 mt-1">Status: <span className={`font-medium capitalize ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{order.payment_status}</span></p>
            </div>
          </div>

          {/* Delivery Address */}
          {order.shipping_address && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FiMapPin className="text-primary-600" /> Delivery Address
              </h3>
              <p className="font-medium text-sm text-gray-900 dark:text-white">{order.shipping_address.name}</p>
              <p className="text-sm text-gray-500">{order.shipping_address.address}</p>
              <p className="text-sm text-gray-500">{order.shipping_address.city}</p>
              <p className="text-sm text-gray-500">{order.shipping_address.phone}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
