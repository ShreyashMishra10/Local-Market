import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../../store/cartSlice'
import { productService } from '../../services/productService'
import { reviewService } from '../../services/reviewService'
import { useAuth } from '../../context/AuthContext'
import ProductCard from '../../components/product/ProductCard'
import {
  FiShoppingCart, FiHeart, FiStar, FiMapPin, FiPackage,
  FiTruck, FiShield, FiChevronLeft, FiShare2, FiMinus, FiPlus,
} from 'react-icons/fi'
import { formatCurrency, formatDate, getInitials } from '../../utils/helpers'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function ProductDetail() {
  const { id }    = useParams()
  const dispatch  = useDispatch()
  const { user }  = useAuth()

  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [quantity, setQuantity]   = useState(1)
  const [activeImg, setActiveImg] = useState(0)
  const [adding, setAdding]       = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  // Review form
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLoading(true)
    productService.getProduct(id)
      .then(r => setData(r.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login first'); return }
    setAdding(true)
    try {
      await dispatch(addToCart({ product_id: id, quantity })).unwrap()
      toast.success(`${quantity} item(s) added to cart!`)
    } catch (err) {
      toast.error(err || 'Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login'); return }
    try {
      if (wishlisted) {
        await api.delete(`/wishlist/${id}`)
        setWishlisted(false)
        toast.success('Removed from wishlist')
      } else {
        await api.post('/wishlist/add', { product_id: id })
        setWishlisted(true)
        toast.success('Added to wishlist!')
      }
    } catch { toast.error('Failed') }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Login to review'); return }
    if (reviewForm.comment.length < 10) { toast.error('Comment must be at least 10 characters'); return }
    setSubmitting(true)
    try {
      await reviewService.createReview({ ...reviewForm, product_id: id })
      toast.success('Review submitted!')
      setReviewForm({ rating: 5, comment: '' })
      const r = await productService.getProduct(id)
      setData(r.data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-6 rounded" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!data) return <div className="page-container py-20 text-center text-gray-500">Product not found</div>

  const { product, similar } = data
  const images = product.images?.length ? product.images : [`https://picsum.photos/seed/${id}/600/600`]

  return (
    <div className="page-container py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img src={images[activeImg]} alt={product.title} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-primary-600' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          {product.category && (
            <Link to={`/products?category=${product.category.name}`} className="text-primary-600 text-sm font-medium">
              {product.category.name}
            </Link>
          )}

          <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-900 dark:text-white leading-tight">
            {product.title}
          </h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} className={`text-sm ${i < Math.round(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              ))}
              <span className="text-sm font-semibold text-gray-900 dark:text-white ml-1">{product.rating?.toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-500">({product.total_reviews} reviews)</span>
            <span className={`badge ${product.stock > 0 ? 'badge-green' : 'badge-red'}`}>
              {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </span>
          </div>

          <div className="flex items-end gap-3">
            <span className="font-display font-bold text-4xl text-gray-900 dark:text-white">{formatCurrency(product.price)}</span>
            {product.original_price > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatCurrency(product.original_price)}</span>
                <span className="badge badge-green text-sm">{product.discount_percentage?.toFixed(0)}% OFF</span>
              </>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-sm">#{tag}</span>
              ))}
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
            <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-l-xl">
                <FiMinus className="text-sm" />
              </button>
              <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-r-xl">
                <FiPlus className="text-sm" />
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
            >
              <FiShoppingCart /> {adding ? 'Adding...' : 'Add to Cart'}
            </button>
            <button onClick={handleWishlist} className={`p-3 rounded-xl border-2 transition-all ${wishlisted ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-300'}`}>
              <FiHeart className={wishlisted ? 'fill-current' : ''} />
            </button>
            <button className="p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300">
              <FiShare2 />
            </button>
          </div>

          {/* Delivery info */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: FiTruck, label: 'Free Delivery', sub: 'Orders above ₹500' },
              { icon: FiShield, label: 'Secure Pay', sub: '100% protected' },
              { icon: FiPackage, label: 'Easy Return', sub: '7 day policy' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="card p-3 text-center">
                <Icon className="text-primary-600 mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>

          {/* Vendor */}
          {product.vendor && (
            <Link to={`/vendors/${product.vendor_id}`} className="card p-4 flex items-center gap-4 hover:border-primary-200 dark:hover:border-primary-800 transition-colors">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl flex items-center justify-center font-bold">
                {product.vendor.shop_name?.[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{product.vendor.shop_name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <FiMapPin className="text-xs" /> {product.city}
                </p>
              </div>
              <FiStar className="ml-auto text-yellow-400 fill-current" />
              <span className="text-sm font-semibold">{product.vendor.rating?.toFixed(1)}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="card p-6">
        <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-6">Customer Reviews</h2>

        {/* Write Review */}
        {user && (
          <form onSubmit={submitReview} className="mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Write a Review</h3>
            <div className="flex gap-2 mb-3">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" onClick={() => setReviewForm(f => ({...f, rating: s}))}>
                  <FiStar className={`text-2xl ${s <= reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewForm.comment}
              onChange={e => setReviewForm(f => ({...f, comment: e.target.value}))}
              placeholder="Share your experience with this product..."
              rows={3}
              className="input-field resize-none mb-3"
            />
            <button type="submit" disabled={submitting} className="btn-primary text-sm px-5 py-2">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Reviews list */}
        {product.reviews?.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {product.reviews?.map(review => (
              <div key={review._id} className="border-b border-gray-100 dark:border-gray-800 pb-4 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {getInitials(review.user?.name || 'U')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">{review.user?.name || 'Anonymous'}</span>
                      <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className={`text-xs ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                      {review.is_verified && <span className="badge badge-green ml-2 text-xs">Verified Purchase</span>}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                    {review.reply && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Vendor's Reply:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{review.reply}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Similar Products */}
      {similar?.length > 0 && (
        <div>
          <h2 className="section-title mb-6">Similar Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {similar.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}
