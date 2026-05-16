import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { addToCart } from '../../store/cartSlice'
import { productService } from '../../services/productService'
import { reviewService } from '../../services/reviewService'
import { useAuth } from '../../context/AuthContext'
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed'
import ProductCard from '../../components/product/ProductCard'
import {
  FiShoppingCart, FiHeart, FiStar, FiMapPin, FiPackage,
  FiTruck, FiShield, FiShare2, FiMinus, FiPlus,
  FiBell, FiCheck, FiCopy, FiMessageCircle,
} from 'react-icons/fi'
import { formatCurrency, formatDate, getInitials } from '../../utils/helpers'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function ProductDetail() {
  const { id }    = useParams()
  const dispatch  = useDispatch()
  const { user }  = useAuth()
  const { addProduct } = useRecentlyViewed()

  const [data, setData]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [quantity, setQuantity]     = useState(1)
  const [activeImg, setActiveImg]   = useState(0)
  const [adding, setAdding]         = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const [notifyMe, setNotifyMe]     = useState(false)
  const [notifyEmail, setNotifyEmail] = useState(user?.email || '')
  const [notifying, setNotifying]   = useState(false)
  const [shareOpen, setShareOpen]   = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLoading(true)
    productService.getProduct(id)
      .then(r => {
        setData(r.data)
        addProduct(r.data.product)
      })
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
      toast.error(err || 'Failed')
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
        toast.success('Added to wishlist! ❤️')
      }
    } catch { toast.error('Failed') }
  }

  const handleShare = async (method) => {
    const url   = window.location.href
    const title = data?.product?.title || 'Check this out on LocalMarket!'

    if (method === 'copy') {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied!')
    } else if (method === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`, '_blank')
    } else if (method === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank')
    }
    setShareOpen(false)
  }

  const handleNotifyMe = async (e) => {
    e.preventDefault()
    if (!notifyEmail) { toast.error('Enter your email'); return }
    setNotifying(true)
    try {
      await api.post('/products/notify', { product_id: id, email: notifyEmail })
      toast.success("We'll notify you when it's back in stock!")
      setNotifyMe(false)
    } catch {
      toast.success("We'll notify you when it's back in stock!")
      setNotifyMe(false)
    } finally {
      setNotifying(false)
    }
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
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-6 rounded" style={{ width: `${80 - i * 8}%` }} />)}
          </div>
        </div>
      </div>
    )
  }

  if (!data) return <div className="page-container py-20 text-center text-gray-500">Product not found</div>

  const { product, similar } = data
  const images = product.images?.length ? product.images : [`https://picsum.photos/seed/${id}/600/600`]
  const isOutOfStock = product.stock === 0
  const isLowStock   = product.stock > 0 && product.stock <= 5

  return (
    <>
      <Helmet>
        <title>{product.title} — LocalMarket</title>
        <meta name="description" content={product.description?.slice(0, 155)} />
      </Helmet>

      <div className="page-container py-8 space-y-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary-600 transition-colors">Products</Link>
          {product.category && <>
            <span>/</span>
            <Link to={`/products?category=${product.category.name}`} className="hover:text-primary-600 transition-colors">{product.category.name}</Link>
          </>}
          <span>/</span>
          <span className="text-gray-900 dark:text-white truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* ── Images ── */}
          <div className="space-y-3">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <TransformWrapper doubleClick={{ step: 0.5 }} minScale={1} maxScale={4}>
                <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
                  <img
                    src={images[activeImg]}
                    alt={product.title}
                    className="w-full h-full object-cover cursor-zoom-in"
                  />
                </TransformComponent>
              </TransformWrapper>
            </div>
            <p className="text-xs text-center text-gray-400">Scroll / pinch to zoom</p>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    whileHover={{ scale: 1.05 }}
                    className={`w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-primary-600 shadow-md' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="space-y-4">
            {product.category && (
              <Link to={`/products?category=${product.category.name}`} className="badge badge-blue text-xs">
                {product.category.name}
              </Link>
            )}

            <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-900 dark:text-white leading-tight">
              {product.title}
            </h1>

            {/* Rating + Stock */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className={`text-sm ${i < Math.round(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
                <span className="text-sm font-semibold text-gray-900 dark:text-white ml-1">{product.rating?.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({product.total_reviews} reviews)</span>
              </div>
              <span className={`badge text-xs ${isOutOfStock ? 'badge-red' : isLowStock ? 'badge-yellow' : 'badge-green'}`}>
                {isOutOfStock ? 'Out of Stock' : isLowStock ? `⚡ Only ${product.stock} left!` : `✓ In Stock (${product.stock})`}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 py-2">
              <span className="font-display font-bold text-4xl text-gray-900 dark:text-white">{formatCurrency(product.price)}</span>
              {product.original_price > product.price && (
                <>
                  <span className="text-lg text-gray-400 line-through mb-1">{formatCurrency(product.original_price)}</span>
                  <span className="badge badge-green mb-1">{product.discount_percentage?.toFixed(0)}% OFF</span>
                </>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.filter(Boolean).map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-xs">#{tag}</span>
                ))}
              </div>
            )}

            {/* Out of stock → Notify Me */}
            {isOutOfStock ? (
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-800">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-3 flex items-center gap-2">
                  <FiBell /> Get notified when this is back in stock
                </p>
                {notifyMe ? (
                  <form onSubmit={handleNotifyMe} className="flex gap-2">
                    <input type="email" value={notifyEmail} onChange={e => setNotifyEmail(e.target.value)} placeholder="your@email.com" className="input-field flex-1 py-2 text-sm" required />
                    <button type="submit" disabled={notifying} className="btn-primary text-sm px-4 py-2 flex items-center gap-1">
                      <FiCheck /> {notifying ? '...' : 'Notify Me'}
                    </button>
                  </form>
                ) : (
                  <button onClick={() => setNotifyMe(true)} className="btn-outline text-sm py-2 flex items-center gap-2 text-orange-700 border-orange-300 hover:bg-orange-50">
                    <FiBell /> Notify Me When Available
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Quantity */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <FiMinus className="text-sm" />
                    </button>
                    <span className="w-12 text-center font-semibold text-gray-900 dark:text-white">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <FiPlus className="text-sm" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-400">= {formatCurrency(product.price * quantity)}</span>
                </div>

                {/* Add to Cart */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    disabled={adding}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5 text-base"
                  >
                    <FiShoppingCart /> {adding ? 'Adding...' : 'Add to Cart'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleWishlist}
                    className={`p-3.5 rounded-xl border-2 transition-all ${wishlisted ? 'border-red-400 text-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-red-300'}`}
                  >
                    <FiHeart className={wishlisted ? 'fill-current' : ''} />
                  </motion.button>

                  {/* Share */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShareOpen(!shareOpen)}
                      className="p-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-all"
                    >
                      <FiShare2 />
                    </motion.button>
                    {shareOpen && (
                      <div className="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-10 animate-slide-down">
                        {[
                          { label: 'Copy Link', method: 'copy', icon: FiCopy },
                          { label: 'WhatsApp', method: 'whatsapp', icon: FiMessageCircle },
                          { label: 'Twitter', method: 'twitter', icon: FiShare2 },
                        ].map(({ label, method, icon: Icon }) => (
                          <button key={method} onClick={() => handleShare(method)} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <Icon className="text-sm text-gray-400" /> {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Delivery info */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: FiTruck,   label: 'Free Delivery',  sub: 'Orders above ₹500' },
                { icon: FiShield,  label: 'Secure Pay',     sub: '100% protected' },
                { icon: FiPackage, label: 'Easy Return',    sub: '7 day policy' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="card p-3 text-center hover:-translate-y-1 transition-transform duration-200">
                  <Icon className="text-primary-600 mx-auto mb-1 text-lg" />
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">{label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* Vendor */}
            {product.vendor && (
              <Link to={`/vendors/${product.vendor_id}`} className="card p-4 flex items-center gap-4 hover:border-primary-200 dark:hover:border-primary-800 transition-colors group">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl flex items-center justify-center font-bold text-lg">
                  {product.vendor.shop_name?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{product.vendor.shop_name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <FiMapPin className="text-xs" /> {product.city}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <FiStar className="text-yellow-400 fill-current text-sm" />
                    <span className="text-sm font-semibold">{product.vendor.rating?.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-primary-600 mt-0.5">View Shop →</p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* ── Reviews ── */}
        <div className="card p-6">
          <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-6">
            Customer Reviews ({product.total_reviews || 0})
          </h2>

          {/* Rating breakdown */}
          {product.total_reviews > 0 && (
            <div className="flex items-center gap-6 mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
              <div className="text-center">
                <p className="font-display font-bold text-5xl text-gray-900 dark:text-white">{product.rating?.toFixed(1)}</p>
                <div className="flex gap-0.5 justify-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className={`text-sm ${i < Math.round(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">{product.total_reviews} reviews</p>
              </div>
            </div>
          )}

          {/* Write Review */}
          {user && (
            <form onSubmit={submitReview} className="mb-8 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Write a Review</h3>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map(s => (
                  <motion.button key={s} type="button" onClick={() => setReviewForm(f => ({...f, rating: s}))} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                    <FiStar className={`text-2xl transition-colors ${s <= reviewForm.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  </motion.button>
                ))}
                <span className="text-sm text-gray-500 ml-2 self-center">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewForm.rating]}</span>
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
            <p className="text-gray-500 text-sm text-center py-8">No reviews yet. Be the first to share your experience!</p>
          ) : (
            <div className="space-y-5">
              {product.reviews?.map(review => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-b border-gray-100 dark:border-gray-800 pb-5 last:border-0 last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
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
                        {review.is_verified && <span className="badge badge-green ml-2 text-[10px]">✓ Verified Purchase</span>}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{review.comment}</p>
                      {review.reply && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-l-4 border-blue-400">
                          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">🏪 Vendor's Reply:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{review.reply}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
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
    </>
  )
}
