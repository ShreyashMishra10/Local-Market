import { useEffect, useState, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import jsPDF from 'jspdf'
import { orderService } from '../../services/orderService'
import { useDispatch } from 'react-redux'
import { addToCart } from '../../store/cartSlice'
import { formatCurrency, formatDate, formatDateTime, getStatusColor, getStatusLabel } from '../../utils/helpers'
import { FiPackage, FiMapPin, FiCheckCircle, FiDownload, FiRefreshCw, FiPrinter } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function OrderDetail() {
  const { id }       = useParams()
  const location     = useLocation()
  const navigate     = useNavigate()
  const dispatch     = useDispatch()
  const [order, setOrder]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [reordering, setReordering] = useState(false)
  const showSuccess = location.state?.success
  const confettiFired = useRef(false)

  useEffect(() => {
    orderService.getOrder(id)
      .then(r => setOrder(r.data))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false))
  }, [id])

  // Fire confetti on success
  useEffect(() => {
    if (showSuccess && order && !confettiFired.current) {
      confettiFired.current = true
      const duration = 3000
      const end = Date.now() + duration

      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#dc2626', '#f97316', '#eab308'] })
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#16a34a', '#3b82f6', '#8b5cf6'] })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
    }
  }, [showSuccess, order])

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

  const handleReorder = async () => {
    if (!order?.items?.length) return
    setReordering(true)
    try {
      for (const item of order.items) {
        await dispatch(addToCart({ product_id: item.product_id, quantity: item.quantity })).unwrap()
      }
      toast.success('All items added to cart!')
      navigate('/cart')
    } catch {
      toast.error('Some items may be unavailable')
      navigate('/cart')
    } finally {
      setReordering(false)
    }
  }

  const handleDownloadInvoice = () => {
    if (!order) return
    const doc = new jsPDF()
    const pageW = doc.internal.pageSize.getWidth()

    // Header
    doc.setFillColor(220, 38, 38)
    doc.rect(0, 0, pageW, 35, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('LocalMarket', 15, 20)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Your Local Shopping Destination', 15, 28)

    // Invoice title
    doc.setTextColor(40, 40, 40)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('INVOICE', pageW - 15, 20, { align: 'right' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`#${order.order_number}`, pageW - 15, 28, { align: 'right' })

    // Order info
    doc.setTextColor(40, 40, 40)
    doc.setFontSize(10)
    doc.text(`Date: ${formatDate(order.created_at)}`, 15, 50)
    doc.text(`Status: ${getStatusLabel(order.status)}`, 15, 58)
    doc.text(`Payment: ${order.payment_method?.toUpperCase()}`, 15, 66)

    // Shipping address
    if (order.shipping_address) {
      doc.setFont('helvetica', 'bold')
      doc.text('Deliver To:', pageW / 2, 50)
      doc.setFont('helvetica', 'normal')
      doc.text(order.shipping_address.name || '', pageW / 2, 58)
      doc.text(order.shipping_address.address || '', pageW / 2, 66)
      doc.text(`${order.shipping_address.city || ''} — ${order.shipping_address.phone || ''}`, pageW / 2, 74)
    }

    // Items table header
    let y = 90
    doc.setFillColor(245, 245, 245)
    doc.rect(15, y - 6, pageW - 30, 10, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('Item', 18, y)
    doc.text('Qty', pageW - 60, y, { align: 'right' })
    doc.text('Price', pageW - 30, y, { align: 'right' })
    doc.text('Total', pageW - 15, y, { align: 'right' })

    y += 10
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)

    for (const item of order.items || []) {
      doc.text(item.title?.slice(0, 50) || '', 18, y)
      doc.text(String(item.quantity), pageW - 60, y, { align: 'right' })
      doc.text(formatCurrency(item.price), pageW - 30, y, { align: 'right' })
      doc.text(formatCurrency(item.total), pageW - 15, y, { align: 'right' })
      y += 8
      if (y > 250) { doc.addPage(); y = 20 }
    }

    // Totals
    y += 5
    doc.setDrawColor(200, 200, 200)
    doc.line(15, y, pageW - 15, y)
    y += 8
    doc.text(`Subtotal:`, pageW - 60, y); doc.text(formatCurrency(order.subtotal), pageW - 15, y, { align: 'right' })
    if (order.discount > 0) { y += 7; doc.setTextColor(22, 163, 74); doc.text('Discount:', pageW - 60, y); doc.text(`-${formatCurrency(order.discount)}`, pageW - 15, y, { align: 'right' }) }
    doc.setTextColor(40, 40, 40)
    y += 7; doc.text('Shipping:', pageW - 60, y); doc.text(order.shipping_fee === 0 ? 'FREE' : formatCurrency(order.shipping_fee), pageW - 15, y, { align: 'right' })
    y += 5; doc.line(pageW - 80, y, pageW - 15, y)
    y += 7; doc.setFont('helvetica', 'bold'); doc.setFontSize(11)
    doc.text('TOTAL:', pageW - 60, y); doc.text(formatCurrency(order.total), pageW - 15, y, { align: 'right' })

    // Footer
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text('Thank you for supporting local businesses! — LocalMarket', pageW / 2, 285, { align: 'center' })

    doc.save(`LocalMarket-Invoice-${order.order_number}.pdf`)
    toast.success('Invoice downloaded!')
  }

  if (loading) return <div className="page-container py-8"><div className="skeleton h-96 rounded-2xl" /></div>
  if (!order) return <div className="page-container py-20 text-center text-gray-500">Order not found</div>

  const statusSteps = ['pending', 'confirmed', 'shipped', 'delivered']
  const currentStep = statusSteps.indexOf(order.status)

  return (
    <>
      <Helmet><title>Order {order.order_number} — LocalMarket</title></Helmet>

      <div className="page-container py-8">
        {/* Success Banner */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-5 mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 flex items-center gap-4"
          >
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center flex-shrink-0">
              <FiCheckCircle className="text-3xl text-green-500" />
            </div>
            <div>
              <h3 className="font-bold text-green-800 dark:text-green-300 text-lg">🎉 Order Placed Successfully!</h3>
              <p className="text-sm text-green-600 dark:text-green-400">Order #{order.order_number} is confirmed. Thank you for supporting local businesses!</p>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">{order.order_number}</h1>
            <p className="text-gray-500 text-sm">Placed on {formatDateTime(order.created_at)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`badge ${getStatusColor(order.status)} text-sm px-4 py-2`}>{getStatusLabel(order.status)}</span>

            {/* Re-order */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReorder}
              disabled={reordering}
              className="btn-outline flex items-center gap-1.5 text-sm py-2 px-4"
            >
              <FiRefreshCw className={`text-xs ${reordering ? 'animate-spin' : ''}`} />
              {reordering ? 'Adding...' : 'Re-order'}
            </motion.button>

            {/* Invoice */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownloadInvoice}
              className="btn-outline flex items-center gap-1.5 text-sm py-2 px-4"
            >
              <FiDownload className="text-xs" /> Invoice
            </motion.button>

            {/* Cancel */}
            {['pending', 'confirmed'].includes(order.status) && (
              <button onClick={handleCancel} disabled={cancelling} className="btn-outline text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm py-2 px-4">
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
                <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Order Tracking</h3>
                <div className="relative flex items-start justify-between">
                  {/* Progress line */}
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 dark:bg-gray-700" />
                  <div
                    className="absolute top-4 left-4 h-0.5 bg-primary-600 transition-all duration-500"
                    style={{ width: `${(currentStep / (statusSteps.length - 1)) * (100 - 8)}%` }}
                  />
                  {statusSteps.map((s, i) => (
                    <div key={s} className="flex flex-col items-center relative z-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                          ${currentStep > i ? 'bg-primary-600 border-primary-600 text-white'
                          : currentStep === i ? 'bg-primary-600 border-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900/30'
                          : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-400'}`}
                      >
                        {currentStep > i ? '✓' : i + 1}
                      </motion.div>
                      <span className={`text-xs mt-2 capitalize font-medium ${currentStep >= i ? 'text-primary-600' : 'text-gray-400'}`}>{s}</span>
                    </div>
                  ))}
                </div>

                {/* Status history */}
                {order.status_history?.length > 0 && (
                  <div className="mt-6 space-y-2">
                    {[...order.status_history].reverse().map((h, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${i === 0 ? 'bg-primary-600' : 'bg-gray-300'}`} />
                        <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{h.status}</span>
                        <span className="text-gray-400 text-xs">{h.note}</span>
                        <span className="text-gray-400 text-xs ml-auto">{formatDate(h.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Items */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Items ({(order.items || []).length})</h3>
              <div className="space-y-4">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                    <img src={item.image || `https://picsum.photos/seed/${item.product_id}/60/60`} className="w-16 h-16 rounded-xl object-cover" alt="" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.quantity} × {formatCurrency(item.price)}</p>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Price */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Price Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>}
                <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{order.shipping_fee === 0 ? '🎉 FREE' : formatCurrency(order.shipping_fee)}</span></div>
                <div className="border-t pt-2 flex justify-between font-bold text-base text-gray-900 dark:text-white">
                  <span>Total</span><span>{formatCurrency(order.total)}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-1">
                <p className="text-xs text-gray-500">Payment: <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{order.payment_method}</span></p>
                <p className="text-xs text-gray-500">Status: <span className={`font-medium capitalize ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{order.payment_status}</span></p>
              </div>
            </div>

            {/* Address */}
            {order.shipping_address && (
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FiMapPin className="text-primary-600" /> Delivery Address
                </h3>
                <p className="font-medium text-sm text-gray-900 dark:text-white">{order.shipping_address.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{order.shipping_address.address}</p>
                <p className="text-sm text-gray-500">{order.shipping_address.city}</p>
                <p className="text-sm text-gray-500">{order.shipping_address.phone}</p>
              </div>
            )}

            {/* Download Invoice */}
            <button onClick={handleDownloadInvoice} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              <FiDownload /> Download Invoice (PDF)
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
