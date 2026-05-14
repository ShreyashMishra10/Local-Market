import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCart, resetCart } from '../../store/cartSlice'
import { orderService } from '../../services/orderService'
import { useAuth } from '../../context/AuthContext'
import { FiCreditCard, FiTruck, FiCheckCircle } from 'react-icons/fi'
import { formatCurrency } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function Checkout() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const { items, subtotal, discount, coupon_code } = useSelector(s => s.cart)

  const [step, setStep]       = useState(1)
  const [placing, setPlacing] = useState(false)
  const [method, setMethod]   = useState('cod')
  const [address, setAddress] = useState({
    name:    user?.name || '',
    phone:   user?.phone || '',
    address: user?.address || '',
    city:    user?.city || '',
    pincode: '',
  })

  useEffect(() => { dispatch(fetchCart()) }, [dispatch])

  const shippingFee = subtotal >= 500 ? 0 : 50
  const total       = subtotal - discount + shippingFee

  const handlePlaceOrder = async () => {
    if (!address.name || !address.phone || !address.address || !address.city) {
      toast.error('Please fill all delivery details')
      setStep(1)
      return
    }
    setPlacing(true)
    try {
      const orderItems = items.map(item => ({
        product_id: item.product_id,
        quantity:   item.quantity,
      }))
      const res = await orderService.createOrder({
        items:            orderItems,
        shipping_address: address,
        payment_method:   method,
        coupon_code:      coupon_code,
      })
      dispatch(resetCart())
      toast.success('Order placed successfully!')
      navigate(`/orders/${res.data.order._id}`, { state: { success: true } })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="page-container py-8">
      <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-8">
        {[{ n: 1, label: 'Delivery' }, { n: 2, label: 'Payment' }, { n: 3, label: 'Review' }].map(s => (
          <div key={s.n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
              ${step > s.n ? 'bg-green-500 text-white' : step === s.n ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
              {step > s.n ? '✓' : s.n}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${step === s.n ? 'text-primary-600' : 'text-gray-400'}`}>{s.label}</span>
            {s.n < 3 && <div className={`w-12 h-0.5 ${step > s.n ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="card p-6 space-y-5">
              <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <FiTruck className="text-primary-600" /> Delivery Address
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
                  <input type="text" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone *</label>
                  <input type="tel" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} className="input-field" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Street Address *</label>
                <textarea value={address.address} onChange={e => setAddress({...address, address: e.target.value})} rows={2} className="input-field resize-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City *</label>
                  <input type="text" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Pincode</label>
                  <input type="text" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} className="input-field" />
                </div>
              </div>
              <button onClick={() => setStep(2)} className="btn-primary w-full py-3">Continue to Payment</button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="card p-6 space-y-5">
              <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <FiCreditCard className="text-primary-600" /> Payment Method
              </h2>
              {[
                { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive', icon: '💵' },
                { value: 'stripe', label: 'Credit/Debit Card', desc: 'Secure card payment via Stripe', icon: '💳' },
                { value: 'razorpay', label: 'UPI / Net Banking', desc: 'Pay via Razorpay', icon: '📱' },
              ].map(opt => (
                <label key={opt.value} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${method === opt.value ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value={opt.value} checked={method === opt.value} onChange={() => setMethod(opt.value)} className="text-primary-600" />
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{opt.label}</p>
                    <p className="text-sm text-gray-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-outline flex-1 py-3">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1 py-3">Review Order</button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="card p-6 space-y-5">
              <h2 className="font-display font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <FiCheckCircle className="text-primary-600" /> Review & Place Order
              </h2>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Delivery to:</h4>
                <p className="text-sm text-gray-900 dark:text-white font-semibold">{address.name}</p>
                <p className="text-sm text-gray-500">{address.address}, {address.city}</p>
                <p className="text-sm text-gray-500">{address.phone}</p>
              </div>

              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.product_id} className="flex items-center gap-3">
                    <img src={item.image || `https://picsum.photos/seed/${item.product_id}/60/60`} className="w-12 h-12 rounded-xl object-cover" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-gray-900 dark:text-white">{item.title}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-sm">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-outline flex-1 py-3">Back</button>
                <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary flex-1 py-3">
                  {placing ? 'Placing...' : `Place Order (${formatCurrency(total)})`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="card p-5 h-fit">
          <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(discount)}</span></div>}
            <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}</span></div>
            <div className="border-t pt-2 flex justify-between font-bold text-base text-gray-900 dark:text-white">
              <span>Total</span><span>{formatCurrency(total)}</span>
            </div>
          </div>
          {items.slice(0, 3).map(item => (
            <div key={item.product_id} className="flex items-center gap-2 mb-2">
              <img src={item.image || `https://picsum.photos/seed/${item.product_id}/40/40`} className="w-10 h-10 rounded-lg object-cover" alt="" />
              <span className="text-xs text-gray-500 truncate">{item.title}</span>
            </div>
          ))}
          {items.length > 3 && <p className="text-xs text-gray-400">+{items.length - 3} more items</p>}
        </div>
      </div>
    </div>
  )
}
