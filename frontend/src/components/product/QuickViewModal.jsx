import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { addToCart } from '../../store/cartSlice'
import { useAuth } from '../../context/AuthContext'
import {
  FiX, FiShoppingCart, FiHeart, FiStar, FiMapPin,
  FiMinus, FiPlus, FiExternalLink,
} from 'react-icons/fi'
import { formatCurrency } from '../../utils/helpers'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function QuickViewModal({ product, onClose }) {
  const dispatch  = useDispatch()
  const { user }  = useAuth()
  const [qty, setQty]           = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [adding, setAdding]     = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  const images = product.images?.length
    ? product.images
    : [`https://picsum.photos/seed/${product._id}/500/500`]

  const handleAdd = async () => {
    if (!user) { toast.error('Please login first'); return }
    setAdding(true)
    try {
      await dispatch(addToCart({ product_id: product._id, quantity: qty })).unwrap()
      toast.success(`${qty} item(s) added to cart!`)
      onClose()
    } catch (err) {
      toast.error(err || 'Failed')
    } finally {
      setAdding(false)
    }
  }

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login'); return }
    try {
      if (wishlisted) {
        await api.delete(`/wishlist/${product._id}`)
        setWishlisted(false)
      } else {
        await api.post('/wishlist/add', { product_id: product._id })
        setWishlisted(true)
        toast.success('Added to wishlist!')
      }
    } catch { toast.error('Failed') }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {/* Images */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4">
              <div className="aspect-square rounded-2xl overflow-hidden mb-3">
                <motion.img
                  key={activeImg}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={images[activeImg]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-primary-600' : 'border-transparent'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 pr-3">
                  {product.category && (
                    <span className="text-xs text-primary-600 font-medium">{product.category.name}</span>
                  )}
                  <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white mt-0.5 leading-snug">
                    {product.title}
                  </h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0">
                  <FiX className="text-lg text-gray-500" />
                </button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className={`text-sm ${i < Math.round(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({product.total_reviews || 0} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-end gap-2 mb-3">
                <span className="font-display font-bold text-3xl text-gray-900 dark:text-white">{formatCurrency(product.price)}</span>
                {product.original_price > product.price && (
                  <span className="text-gray-400 line-through text-sm mb-1">{formatCurrency(product.original_price)}</span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-3">
                {product.description}
              </p>

              {/* Stock */}
              <div className="mb-4">
                <span className={`badge text-xs ${product.stock > 10 ? 'badge-green' : product.stock > 0 ? 'badge-yellow' : 'badge-red'}`}>
                  {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left!` : 'Out of Stock'}
                </span>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Qty:</span>
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-l-xl"><FiMinus className="text-xs" /></button>
                  <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-r-xl"><FiPlus className="text-xs" /></button>
                </div>
              </div>

              {/* Vendor */}
              {product.vendor && (
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <FiMapPin className="text-primary-400" />
                  <span>{product.vendor.shop_name}</span>
                  {product.city && <span>• {product.city}</span>}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                <button onClick={handleAdd} disabled={adding || product.stock === 0}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                  <FiShoppingCart /> {adding ? 'Adding...' : 'Add to Cart'}
                </button>
                <button onClick={handleWishlist}
                  className={`p-3 rounded-xl border-2 transition-all ${wishlisted ? 'border-red-400 text-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-red-300'}`}>
                  <FiHeart className={wishlisted ? 'fill-current' : ''} />
                </button>
                <Link to={`/products/${product._id}`} onClick={onClose}
                  className="p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-all">
                  <FiExternalLink />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
