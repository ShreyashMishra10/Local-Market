import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, useInView } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { fetchFeatured, fetchTrending } from '../store/productSlice'
import { vendorService } from '../services/vendorService'
import ProductCard from '../components/product/ProductCard'
import VendorCard from '../components/vendor/VendorCard'
import AnimatedCounter from '../components/common/AnimatedCounter'
import { useRecentlyViewed } from '../hooks/useRecentlyViewed'
import {
  FiArrowRight, FiShoppingBag, FiSearch, FiMapPin,
  FiStar, FiTruck, FiShield, FiRefreshCw, FiClock,
} from 'react-icons/fi'

const CATEGORIES = [
  { name: 'Groceries',    icon: '🛒', color: 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40', border: 'hover:border-green-300', text: 'text-green-700 dark:text-green-400' },
  { name: 'Clothing',     icon: '👗', color: 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100', border: 'hover:border-purple-300', text: 'text-purple-700 dark:text-purple-400' },
  { name: 'Electronics',  icon: '📱', color: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100', border: 'hover:border-blue-300', text: 'text-blue-700 dark:text-blue-400' },
  { name: 'Handicrafts',  icon: '🏺', color: 'bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100', border: 'hover:border-amber-300', text: 'text-amber-700 dark:text-amber-400' },
  { name: 'Food & Dining',icon: '🍽️', color: 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100', border: 'hover:border-red-300', text: 'text-red-700 dark:text-red-400' },
  { name: 'Furniture',    icon: '🛋️', color: 'bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100', border: 'hover:border-teal-300', text: 'text-teal-700 dark:text-teal-400' },
  { name: 'Beauty',       icon: '💄', color: 'bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100', border: 'hover:border-pink-300', text: 'text-pink-700 dark:text-pink-400' },
  { name: 'Books',        icon: '📚', color: 'bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100', border: 'hover:border-orange-300', text: 'text-orange-700 dark:text-orange-400' },
]

const TESTIMONIALS = [
  { name: 'Priya Sharma', city: 'Mumbai', role: 'Customer', rating: 5, text: 'I found amazing local products that I never knew existed in my city. The quality is outstanding and prices are unbeatable!' },
  { name: 'Rahul Gupta',  city: 'Delhi',  role: 'Vendor',   rating: 5, text: 'As a vendor, this platform helped me reach 10x more customers than my physical store. My revenue tripled in 3 months!' },
  { name: 'Anita Patel',  city: 'Ahmedabad', role: 'Customer', rating: 5, text: 'Supporting local businesses has never been easier. Love the fresh products and super fast delivery!' },
]

const FEATURES = [
  { icon: FiTruck,     title: 'Fast Delivery',    desc: 'Same-day delivery for orders before 2 PM', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
  { icon: FiShield,    title: 'Secure Payment',   desc: '100% secure and encrypted payment gateway', color: 'bg-green-50 dark:bg-green-900/20 text-green-600' },
  { icon: FiRefreshCw, title: 'Easy Returns',     desc: '7-day hassle-free return policy', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' },
  { icon: FiStar,      title: 'Verified Vendors', desc: 'All vendors are verified and trusted', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

function Section({ children, className = '' }) {
  const ref     = useRef(null)
  const inView  = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function Home() {
  const navigate      = useNavigate()
  const reduxDispatch = useDispatch()
  const { featured, trending } = useSelector(s => s.product)
  const [vendors, setVendors]  = useState([])
  const [search, setSearch]    = useState('')
  const { items: recentlyViewed } = useRecentlyViewed()

  useEffect(() => {
    reduxDispatch(fetchFeatured())
    reduxDispatch(fetchTrending())
    vendorService.getFeatured().then(r => setVendors(r.data || [])).catch(() => {})
  }, [reduxDispatch])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`)
  }

  return (
    <>
      <Helmet>
        <title>Local Market — Support Local Businesses Near You</title>
        <meta name="description" content="Discover authentic local products from vendors in your community. Shop fresh, shop local." />
      </Helmet>

      <div className="space-y-16 pb-20 sm:pb-16">
        {/* ─── Hero ─── */}
        <section className="relative bg-gradient-hero text-white overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl" />
          </div>

          <div className="page-container py-20 md:py-28 relative">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-5 py-2 rounded-full mb-6 border border-white/20"
                >
                  🏪 <AnimatedCounter target={100} suffix="+" /> Local Vendors Near You
                </motion.span>

                <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-6">
                  Support Local
                  <span className="block">
                    <span className="text-yellow-300">Businesses</span> Near You
                  </span>
                </h1>
                <p className="text-white/80 text-lg md:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
                  Discover authentic local products from your community. Shop fresh, shop local, and build a stronger community together.
                </p>

                <form onSubmit={handleSearch} className="flex gap-3 max-w-xl mx-auto mb-10">
                  <div className="flex-1 relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search products, vendors, categories..."
                      className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 text-base focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="bg-white text-primary-700 font-bold px-6 py-4 rounded-2xl hover:bg-gray-50 transition-colors shadow-lg whitespace-nowrap"
                  >
                    Search
                  </motion.button>
                </form>

                <div className="flex flex-wrap gap-3 justify-center">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link to="/products" className="bg-white text-primary-700 font-semibold px-8 py-3.5 rounded-2xl hover:bg-gray-50 transition-all hover:shadow-xl flex items-center gap-2">
                      <FiShoppingBag /> Shop Now
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link to="/register?role=vendor" className="border-2 border-white text-white font-semibold px-8 py-3.5 rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2">
                      Become a Vendor <FiArrowRight />
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="bg-black/20 border-t border-white/10">
            <div className="page-container py-5">
              <div className="grid grid-cols-3 gap-6 text-center">
                {[
                  { value: 500, suffix: '+', label: 'Products' },
                  { value: 100, suffix: '+', label: 'Vendors' },
                  { value: 50,  suffix: '+', label: 'Cities' },
                ].map(stat => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <p className="font-display font-bold text-2xl md:text-4xl">
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-white/70 text-sm mt-0.5">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Features ─── */}
        <Section className="page-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <motion.div key={title} variants={fadeUp} className="card p-5 flex items-start gap-4 hover:-translate-y-1 transition-transform duration-300">
                <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className="text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ─── Categories ─── */}
        <Section className="page-container">
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="text-gray-500 mt-1">Find exactly what you're looking for</p>
            </div>
            <Link to="/products" className="text-primary-600 font-medium flex items-center gap-1 hover:gap-2 transition-all text-sm">
              View all <FiArrowRight />
            </Link>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.name} variants={fadeUp} custom={i}>
                <Link
                  to={`/products?category=${encodeURIComponent(cat.name)}`}
                  className={`${cat.color} border-2 border-transparent ${cat.border} rounded-2xl p-4 text-center transition-all duration-200 cursor-pointer block group`}
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">{cat.icon}</div>
                  <p className={`text-xs font-semibold ${cat.text} leading-tight`}>{cat.name}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ─── Featured Vendors ─── */}
        {vendors.length > 0 && (
          <Section className="page-container">
            <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title">🏪 Featured Vendors</h2>
                <p className="text-gray-500 mt-1">Top-rated local shops near you</p>
              </div>
              <Link to="/vendors" className="text-primary-600 font-medium flex items-center gap-1 hover:gap-2 transition-all text-sm">
                View all <FiArrowRight />
              </Link>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {vendors.slice(0, 4).map((v, i) => (
                <motion.div key={v._id} variants={fadeUp} custom={i}>
                  <VendorCard vendor={v} />
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* ─── Trending Products ─── */}
        {trending.length > 0 && (
          <Section className="page-container">
            <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title">🔥 Trending Products</h2>
                <p className="text-gray-500 mt-1">What's hot right now in your community</p>
              </div>
              <Link to="/products?sort=popular" className="text-primary-600 font-medium flex items-center gap-1 hover:gap-2 transition-all text-sm">
                View all <FiArrowRight />
              </Link>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {trending.slice(0, 12).map((p, i) => (
                <motion.div key={p._id} variants={fadeUp} custom={i}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* ─── Featured Products ─── */}
        {featured.length > 0 && (
          <section className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-900 py-14">
            <Section className="page-container">
              <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="section-title">⭐ Featured Products</h2>
                  <p className="text-gray-500 mt-1">Handpicked just for you</p>
                </div>
                <Link to="/products?featured=1" className="text-primary-600 font-medium flex items-center gap-1 hover:gap-2 transition-all text-sm">
                  View all <FiArrowRight />
                </Link>
              </motion.div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {featured.slice(0, 8).map((p, i) => (
                  <motion.div key={p._id} variants={fadeUp} custom={i}>
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>
            </Section>
          </section>
        )}

        {/* ─── Recently Viewed ─── */}
        {recentlyViewed.length > 0 && (
          <Section className="page-container">
            <motion.div variants={fadeUp} className="flex items-center justify-between mb-6">
              <div>
                <h2 className="section-title flex items-center gap-2"><FiClock className="text-primary-600" /> Recently Viewed</h2>
                <p className="text-gray-500 mt-1">Pick up where you left off</p>
              </div>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {recentlyViewed.slice(0, 5).map((p, i) => (
                <motion.div key={p._id} variants={fadeUp} custom={i}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* ─── CTA Banner ─── */}
        <Section className="page-container">
          <motion.div variants={fadeUp}
            className="relative bg-gradient-hero rounded-3xl p-8 md:p-14 text-white text-center overflow-hidden"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-500/20 rounded-full blur-2xl" />
            </div>
            <div className="relative">
              <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
                Have a Local Business? 🏪
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Join hundreds of local vendors who have taken their business online. Start selling today — it's completely free!
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/register?role=vendor" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all hover:shadow-xl">
                    <FiShoppingBag /> Start Selling Now
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/vendors" className="inline-flex items-center gap-2 border-2 border-white text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all">
                    Explore Vendors <FiArrowRight />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </Section>

        {/* ─── Testimonials ─── */}
        <Section className="page-container">
          <motion.div variants={fadeUp} className="text-center mb-10">
            <h2 className="section-title">What Our Community Says 💬</h2>
            <p className="text-gray-500 mt-2">Real stories from real people in your community</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="card p-6 hover:-translate-y-1 transition-transform duration-300">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <FiStar key={j} className="text-yellow-400 fill-current text-sm" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <FiMapPin className="text-xs" /> {t.city} • {t.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
      </div>
    </>
  )
}
