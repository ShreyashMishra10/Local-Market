import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { fetchFeatured, fetchTrending } from '../store/productSlice'
import { vendorService } from '../services/vendorService'
import { useState } from 'react'
import ProductCard from '../components/product/ProductCard'
import VendorCard from '../components/vendor/VendorCard'
import {
  FiArrowRight, FiShoppingBag, FiSearch, FiMapPin,
  FiStar, FiTruck, FiShield, FiRefreshCw,
} from 'react-icons/fi'

const CATEGORIES = [
  { name: 'Groceries',    icon: '🛒', color: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700' },
  { name: 'Clothing',     icon: '👗', color: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700' },
  { name: 'Electronics',  icon: '📱', color: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700' },
  { name: 'Handicrafts',  icon: '🏺', color: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700' },
  { name: 'Food & Dining',icon: '🍽️', color: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700' },
  { name: 'Furniture',    icon: '🛋️', color: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-700' },
  { name: 'Beauty',       icon: '💄', color: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-700' },
  { name: 'Books',        icon: '📚', color: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700' },
]

const TESTIMONIALS = [
  { name: 'Priya Sharma', city: 'Mumbai', rating: 5, text: 'I found amazing local products that I never knew existed in my city. The quality is outstanding!' },
  { name: 'Rahul Gupta',  city: 'Delhi',  rating: 5, text: 'As a vendor, this platform helped me reach 10x more customers than my physical store.' },
  { name: 'Anita Patel',  city: 'Ahmedabad', rating: 5, text: 'Supporting local businesses has never been easier. Love the fresh products!' },
]

const FEATURES = [
  { icon: FiTruck,     title: 'Fast Delivery',    desc: 'Same-day delivery for orders before 2 PM' },
  { icon: FiShield,    title: 'Secure Payment',   desc: '100% secure payment gateway' },
  { icon: FiRefreshCw, title: 'Easy Returns',     desc: '7-day hassle-free returns' },
  { icon: FiStar,      title: 'Quality Products', desc: 'Verified local vendors only' },
]

export default function Home() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { featured, trending } = useSelector(s => s.product)
  const [vendors, setVendors]  = useState([])
  const [search, setSearch]    = useState('')

  useEffect(() => {
    dispatch(fetchFeatured())
    dispatch(fetchTrending())
    vendorService.getFeatured().then(r => setVendors(r.data)).catch(() => {})
  }, [dispatch])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`)
  }

  return (
    <div className="space-y-16 pb-16">
      {/* ─── Hero ─── */}
      <section className="bg-gradient-hero text-white">
        <div className="page-container py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                🏪 100+ Local Vendors Near You
              </span>
              <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl leading-tight mb-6">
                Support Local Businesses
                <span className="block text-yellow-300">Near You</span>
              </h1>
              <p className="text-white/80 text-lg md:text-xl mb-8 leading-relaxed">
                Discover authentic local products from your community. Shop fresh, shop local, support small businesses and build a stronger community.
              </p>

              <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto mb-8">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search products or vendors..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 text-base focus:outline-none focus:ring-4 focus:ring-white/30"
                  />
                </div>
                <button type="submit" className="bg-white text-primary-700 font-bold px-6 py-4 rounded-2xl hover:bg-gray-50 transition-colors whitespace-nowrap">
                  Search
                </button>
              </form>

              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/products" className="bg-white text-primary-700 font-semibold px-8 py-3.5 rounded-2xl hover:bg-gray-50 transition-all hover:shadow-lg flex items-center gap-2">
                  <FiShoppingBag /> Shop Now
                </Link>
                <Link to="/register?role=vendor" className="border-2 border-white text-white font-semibold px-8 py-3.5 rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2">
                  Become a Vendor <FiArrowRight />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-black/20 border-t border-white/10">
          <div className="page-container py-4">
            <div className="grid grid-cols-3 gap-6 text-center">
              {[['500+', 'Products'], ['100+', 'Vendors'], ['50+', 'Cities']].map(([num, label]) => (
                <div key={label}>
                  <p className="font-display font-bold text-2xl md:text-3xl">{num}</p>
                  <p className="text-white/70 text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="page-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 text-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="text-lg" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section className="page-container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Shop by Category</h2>
            <p className="text-gray-500 mt-1">Find what you're looking for</p>
          </div>
          <Link to="/products" className="text-primary-600 font-medium flex items-center gap-1 hover:gap-2 transition-all text-sm">
            View all <FiArrowRight />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className={`${cat.color} rounded-2xl p-4 text-center hover:scale-105 transition-transform duration-200 cursor-pointer`}
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <p className={`text-xs font-semibold ${cat.text} dark:text-gray-200 leading-tight`}>{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Featured Vendors ─── */}
      {vendors.length > 0 && (
        <section className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Featured Vendors</h2>
              <p className="text-gray-500 mt-1">Top-rated local shops near you</p>
            </div>
            <Link to="/vendors" className="text-primary-600 font-medium flex items-center gap-1 hover:gap-2 transition-all text-sm">
              View all <FiArrowRight />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vendors.slice(0, 4).map(v => <VendorCard key={v._id} vendor={v} />)}
          </div>
        </section>
      )}

      {/* ─── Trending Products ─── */}
      {trending.length > 0 && (
        <section className="page-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Trending Products</h2>
              <p className="text-gray-500 mt-1">What's hot right now</p>
            </div>
            <Link to="/products?sort=popular" className="text-primary-600 font-medium flex items-center gap-1 hover:gap-2 transition-all text-sm">
              View all <FiArrowRight />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {trending.slice(0, 12).map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}

      {/* ─── Featured Products ─── */}
      {featured.length > 0 && (
        <section className="bg-gray-100 dark:bg-gray-900/50 py-12">
          <div className="page-container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title">⭐ Featured Products</h2>
                <p className="text-gray-500 mt-1">Handpicked just for you</p>
              </div>
              <Link to="/products?featured=1" className="text-primary-600 font-medium flex items-center gap-1 hover:gap-2 transition-all text-sm">
                View all <FiArrowRight />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.slice(0, 8).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA Banner ─── */}
      <section className="page-container">
        <div className="bg-gradient-hero rounded-3xl p-8 md:p-12 text-white text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
            Have a Local Business?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Join hundreds of local vendors who have taken their business online. Start selling today — it's free!
          </p>
          <Link to="/register?role=vendor" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all hover:shadow-xl">
            <FiShoppingBag /> Start Selling Now
          </Link>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="page-container">
        <div className="text-center mb-10">
          <h2 className="section-title">What Our Community Says</h2>
          <p className="text-gray-500 mt-2">Real stories from real people</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="card p-6">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <FiStar key={j} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1"><FiMapPin className="text-xs" />{t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
