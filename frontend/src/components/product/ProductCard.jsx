import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useAuth } from '../../context/AuthContext'
import { addToCart } from '../../store/cartSlice'
import { FiHeart, FiShoppingCart, FiStar, FiMapPin } from 'react-icons/fi'
import { formatCurrency, calculateDiscount } from '../../utils/helpers'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function ProductCard({ product }) {
  const dispatch = useDispatch()
  const { user } = useAuth()
  const [wishlisted, setWishlisted] = useState(false)
  const [adding, setAdding]         = useState(false)

  const discount = calculateDiscount(product.original_price, product.price)

  const handleAddToCart = async (e) => {
    e.preventDefault()
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

  return (
    <Link to={`/products/${product._id}`} className="group block">
      <div className="card overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square">
          <img
            src={product.images?.[0] || `https://picsum.photos/seed/${product._id}/400/400`}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
              -{discount}%
            </span>
          )}
          {product.is_featured && (
            <span className="absolute top-2 right-10 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
              Featured
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-900 text-sm font-bold px-3 py-1 rounded-lg">Out of Stock</span>
            </div>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all
              ${wishlisted
                ? 'bg-red-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-500'}`}
          >
            <FiHeart className={`text-sm ${wishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {product.vendor && (
            <p className="text-xs text-primary-600 font-medium mb-1 flex items-center gap-1">
              <FiMapPin className="text-xs" />
              {product.vendor.shop_name}
            </p>
          )}

          <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-snug mb-2 line-clamp-2 flex-1">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <FiStar className="text-yellow-400 fill-current text-xs" />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{product.rating?.toFixed(1) || '0.0'}</span>
            <span className="text-xs text-gray-400">({product.total_reviews || 0})</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mt-auto">
            <div>
              <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(product.price)}</span>
              {product.original_price > product.price && (
                <span className="text-xs text-gray-400 line-through ml-1">{formatCurrency(product.original_price)}</span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="w-9 h-9 bg-primary-600 hover:bg-primary-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiShoppingCart className="text-sm" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
