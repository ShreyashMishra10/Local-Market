import { Link } from 'react-router-dom'
import { FiStar, FiMapPin, FiPackage } from 'react-icons/fi'

export default function VendorCard({ vendor }) {
  return (
    <Link to={`/vendors/${vendor._id}`} className="group block">
      <div className="card overflow-hidden hover:-translate-y-1 transition-transform duration-300">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-br from-primary-500 to-orange-500 relative overflow-hidden">
          {vendor.banner_image && (
            <img src={vendor.banner_image} alt="" className="w-full h-full object-cover opacity-60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        <div className="p-4 -mt-8 relative">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800 shadow-md overflow-hidden mb-3">
            {vendor.shop_logo
              ? <img src={vendor.shop_logo} alt={vendor.shop_name} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl">
                  {vendor.shop_name?.[0]?.toUpperCase()}
                </div>
            }
          </div>

          <h3 className="font-display font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
            {vendor.shop_name}
          </h3>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{vendor.category}</p>

          {vendor.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
              {vendor.description}
            </p>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1 text-sm">
              <FiStar className="text-yellow-400 fill-current" />
              <span className="font-semibold text-gray-900 dark:text-white">{vendor.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-gray-400 text-xs">({vendor.total_reviews || 0})</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <FiMapPin className="text-xs" />
              {vendor.city}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
