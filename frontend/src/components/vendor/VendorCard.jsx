import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiStar, FiMapPin, FiZap, FiClock } from 'react-icons/fi'

function getResponseBadge(rating) {
  if (rating >= 4.5) return { label: '⚡ Responds in ~1 hr', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' }
  if (rating >= 4.0) return { label: '🕐 Responds in ~2 hrs', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' }
  return { label: '🕐 Responds in ~4 hrs', color: 'text-gray-500 bg-gray-50 dark:bg-gray-800' }
}

export default function VendorCard({ vendor }) {
  const badge = getResponseBadge(vendor.rating || 0)

  return (
    <Link to={`/vendors/${vendor._id}`} className="group block">
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="card overflow-hidden"
      >
        {/* Banner */}
        <div className="h-24 bg-gradient-to-br from-primary-500 to-orange-500 relative overflow-hidden">
          {vendor.banner_image && (
            <img src={vendor.banner_image} alt="" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Category badge */}
          <span className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/30">
            {vendor.category}
          </span>
        </div>

        <div className="p-4 -mt-8 relative">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800 shadow-md overflow-hidden mb-3">
            {vendor.shop_logo
              ? <img src={vendor.shop_logo} alt={vendor.shop_name} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xl">
                  {vendor.shop_name?.[0]?.toUpperCase()}
                </div>
            }
          </div>

          <h3 className="font-display font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
            {vendor.shop_name}
          </h3>

          {vendor.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
              {vendor.description}
            </p>
          )}

          {/* Response time badge */}
          <div className={`inline-flex items-center gap-1 mt-2 text-[10px] font-medium px-2 py-1 rounded-full ${badge.color}`}>
            <FiClock className="text-[9px]" /> {badge.label}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1 text-sm">
              <FiStar className="text-yellow-400 fill-current" />
              <span className="font-semibold text-gray-900 dark:text-white">{vendor.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-gray-400 text-xs">({vendor.total_reviews || 0})</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <FiMapPin className="text-xs" /> {vendor.city}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
