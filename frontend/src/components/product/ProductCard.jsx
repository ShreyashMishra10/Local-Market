import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useAuth } from '../../context/AuthContext'
import { addToCart } from '../../store/cartSlice'
import { motion } from 'framer-motion'
import { FiHeart, FiShoppingCart, FiStar, FiMapPin, FiEye } from 'react-icons/fi'
import { formatCurrency, calculateDiscount } from '../../utils/helpers'
import QuickViewModal from './QuickViewModal'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function ProductCard({ product, onView }) {
  const dispatch = useDispatch()
  const { user } = useAuth()
  const [wishlisted, setWishlisted] = useState(false)
  const [adding, setAdding]         = useState(false)
  const [quickView, setQuickView]   = useState(false)

  const discount = calculateDiscount(product.original_price, product.price)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { toast.error('Please login to add to cart'); return }
    setAdding(true)
    try {
      await dispatch(addToCart({ product_id: product._id, quantity: 1 })).unwrap()
      toast.success('Added to cart!')
    } catch (err) {
      toast.error(err.message || 'Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { toast.error('Please login'); return }
    try {
      if (wishlisted) {
        await api.delete(`/wishlist/${product._id}`)
        setWishlisted(false)
        toast.success('Removed from wishlist')
      } else {
        await api.post('/wishlist/add', { product_id: product._id })
        setWishlisted(true)
        toast.success('Added to wishlist!')
      }
    } catch {
      toast.error('Failed to update wishlist')
    }
  }

  const handleQuickView = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onView?.(product)
    setQuickView(true)
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Link to={`/products/${product._id}`} className="group block h-full">
          <div className="card overflow-hidden h-full flex flex-col">
            {/* Image */}
            <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square">
              <img
                src={product.images?.[0] || `https://picsum.photos/seed/${product._id}/400/400`}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {discount > 0 && (
                  <span className="bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">-{discount}%</span>
                )}
                {product.is_featured && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">⭐ Featured</span>
                )}
                {product.stock > 0 && product.stock <= 5 && (
                  <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">Only {product.stock} left!</span>
                )}
              </div>

              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-white text-gray-900 text-xs font-bold px-3 py-1 rounded-lg">Out of Stock</span>
                </div>
              )}

              {/* Hover Actions */}
              <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                <button onClick={handleWishlist}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${wishlisted ? 'bg-red-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 hover:bg-red-50 hover:text-red-500'}`}>
                  <FiHeart className={`text-sm ${wishlisted ? 'fill-current' : ''}`} />
                </button>
                <button onClick={handleQuickView}
                  className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 text-gray-600 hover:bg-primary-50 hover:text-primary-600 flex items-center justify-center shadow-md transition-all">
                  <FiEye className="text-sm" />
                </button>
              </div>

              {/* Add to Cart on hover — bottom slide up */}
              <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <button onClick={handleAddToCart} disabled={adding || product.stock === 0}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2.5 transition-colors disabled:opacity-50">
                  {adding ? 'Adding...' : '🛒 Add to Cart'}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-3.5 flex flex-col flex-1">
              {product.vendor && (
                <p className="text-[10px] text-primary-600 font-medium mb-1 flex items-center gap-0.5">
                  <FiMapPin className="text-[9px]" /> {product.vendor.shop_name}
                </p>
              )}

              <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-snug mb-2 line-clamp-2 flex-1">
                {product.title}
              </h3>

              <div className="flex items-center gap-1 mb-3">
                <FiStar className="text-yellow-400 fill-current text-xs" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{product.rating?.toFixed(1) || '0.0'}</span>
                <span className="text-xs text-gray-400">({product.total_reviews || 0})</span>
              </div>

              <div className="flex items-center gap-1.5 mt-auto">
                <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(product.price)}</span>
                {product.original_price > product.price && (
                  <span className="text-xs text-gray-400 line-through">{formatCurrency(product.original_price)}</span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {quickView && <QuickViewModal product={product} onClose={() => setQuickView(false)} />}
    </>
  )
}
