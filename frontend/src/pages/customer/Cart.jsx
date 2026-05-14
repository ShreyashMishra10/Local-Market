import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCart, removeFromCart, updateCartItem } from '../../store/cartSlice'
import { cartService } from '../../services/cartService'
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiTag } from 'react-icons/fi'
import { formatCurrency } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function Cart() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { items, subtotal, discount, total, item_count, coupon_code, loading } = useSelector(s => s.cart)
  const [coupon, setCoupon]         = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  useEffect(() => { dispatch(fetchCart()) }, [dispatch])

  const handleRemove = async (productId) => {
    await dispatch(removeFromCart(productId))
    toast.success('Item removed')
  }

  const handleQtyChange = async (productId, qty) => {
    if (qty < 1) return
    await dispatch(updateCartItem({ productId, quantity: qty }))
  }

  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    if (!coupon.trim()) return
    setApplyingCoupon(true)
    try {
      const res = await cartService.applyCoupon({ code: coupon.trim() })
      dispatch(fetchCart())
      toast.success(res.data.message)
      setCoupon('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid coupon')
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = async () => {
    await cartService.removeCoupon()
    dispatch(fetchCart())
    toast.success('Coupon removed')
  }

  if (items.length === 0 && !loading) {
    return (
      <div className="page-container py-20 text-center">
        <div className="text-8xl mb-6">🛒</div>
        <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Add items from local vendors to get started</p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          <FiShoppingBag /> Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="page-container py-8">
      <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-8">
        Shopping Cart ({item_count} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.product_id} className="card p-4 flex gap-4">
              <img
                src={item.image || item.images?.[0] || `https://picsum.photos/seed/${item.product_id}/100/100`}
                alt={item.title}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product_id}`} className="font-medium text-gray-900 dark:text-white hover:text-primary-600 line-clamp-2 text-sm">
                  {item.title}
                </Link>
                <p className="text-primary-600 font-bold mt-1">{formatCurrency(item.price)}</p>
                {!item.available && (
                  <span className="badge badge-red text-xs mt-1">Insufficient stock</span>
                )}
              </div>
              <div className="flex flex-col items-end gap-3">
                <button onClick={() => handleRemove(item.product_id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <FiTrash2 className="text-lg" />
                </button>
                <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <button onClick={() => handleQtyChange(item.product_id, item.quantity - 1)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-l-xl">
                    <FiMinus className="text-xs" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button onClick={() => handleQtyChange(item.product_id, item.quantity + 1)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-r-xl">
                    <FiPlus className="text-xs" />
                  </button>
                </div>
                <span className="font-bold text-sm text-gray-900 dark:text-white">{formatCurrency(item.total)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <FiTag className="text-primary-600" /> Coupon Code
            </h3>
            {coupon_code ? (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <span className="text-green-700 dark:text-green-300 font-medium text-sm">{coupon_code} applied!</span>
                <button onClick={handleRemoveCoupon} className="text-xs text-red-500 hover:text-red-700">Remove</button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  placeholder="Enter coupon code"
                  className="input-field flex-1 py-2 text-sm"
                />
                <button type="submit" disabled={applyingCoupon} className="btn-primary text-sm px-4 py-2">
                  {applyingCoupon ? '...' : 'Apply'}
                </button>
              </form>
            )}
            <p className="text-xs text-gray-400 mt-2">Try: WELCOME10 or FLAT50</p>
          </div>

          {/* Summary */}
          <div className="card p-5">
            <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal ({item_count} items)</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span>{subtotal >= 500 ? <span className="text-green-600">FREE</span> : formatCurrency(50)}</span>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                <span>Total</span>
                <span>{formatCurrency(total + (subtotal >= 500 ? 0 : 50))}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full mt-6 py-3 flex items-center justify-center gap-2"
            >
              <FiShoppingBag /> Proceed to Checkout
            </button>
            <Link to="/products" className="btn-outline w-full mt-3 text-center block text-sm py-2.5">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
