import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const ILLUSTRATIONS = {
  cart: (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
      <circle cx="100" cy="100" r="90" fill="#FEF2F2" />
      <rect x="55" y="70" width="90" height="70" rx="8" fill="#FCA5A5" />
      <rect x="65" y="85" width="70" height="45" rx="5" fill="white" />
      <circle cx="75" cy="155" r="10" fill="#EF4444" />
      <circle cx="120" cy="155" r="10" fill="#EF4444" />
      <path d="M45 70 L55 70" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
      <line x1="80" y1="92" x2="120" y2="92" stroke="#FCA5A5" strokeWidth="3" strokeLinecap="round" />
      <line x1="80" y1="103" x2="110" y2="103" stroke="#FCA5A5" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  wishlist: (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
      <circle cx="100" cy="100" r="90" fill="#FFF1F2" />
      <path d="M100 140 C100 140 55 110 55 80 C55 65 68 55 80 60 C88 63 95 70 100 78 C105 70 112 63 120 60 C132 55 145 65 145 80 C145 110 100 140 100 140Z" fill="#FDA4AF" stroke="#F43F5E" strokeWidth="2" />
      <path d="M100 130 C100 130 65 108 65 82" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  ),
  orders: (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
      <circle cx="100" cy="100" r="90" fill="#F0FDF4" />
      <rect x="55" y="55" width="90" height="110" rx="8" fill="#86EFAC" />
      <rect x="65" y="70" width="70" height="8" rx="4" fill="white" />
      <rect x="65" y="85" width="50" height="8" rx="4" fill="white" />
      <rect x="65" y="100" width="60" height="8" rx="4" fill="white" />
      <circle cx="145" cy="145" r="25" fill="#22C55E" />
      <path d="M135 145 L141 151 L155 138" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  products: (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
      <circle cx="100" cy="100" r="90" fill="#EFF6FF" />
      <rect x="50" y="70" width="50" height="60" rx="6" fill="#BFDBFE" />
      <rect x="110" y="70" width="40" height="60" rx="6" fill="#93C5FD" />
      <rect x="50" y="50" width="30" height="15" rx="3" fill="#3B82F6" />
      <circle cx="150" cy="58" r="18" fill="#FEF08A" stroke="#EAB308" strokeWidth="2" />
      <path d="M150 50 L152 55 L158 55 L153 59 L155 65 L150 62 L145 65 L147 59 L142 55 L148 55Z" fill="#EAB308" />
    </svg>
  ),
  notifications: (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
      <circle cx="100" cy="100" r="90" fill="#F5F3FF" />
      <path d="M100 55 C78 55 65 70 65 90 L65 120 L50 135 L150 135 L135 120 L135 90 C135 70 122 55 100 55Z" fill="#C4B5FD" />
      <rect x="85" y="135" width="30" height="12" rx="6" fill="#8B5CF6" />
      <circle cx="130" cy="65" r="15" fill="#EF4444" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
      <circle cx="100" cy="100" r="90" fill="#F8FAFC" />
      <circle cx="88" cy="88" r="35" stroke="#94A3B8" strokeWidth="6" fill="none" />
      <line x1="114" y1="114" x2="140" y2="140" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
      <line x1="78" y1="88" x2="98" y2="88" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
      <line x1="78" y1="98" x2="92" y2="98" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
    </svg>
  ),
}

export default function EmptyState({
  type = 'products',
  title,
  description,
  action,
  actionLabel,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-40 h-40 mb-6">
        {ILLUSTRATIONS[type] || ILLUSTRATIONS.products}
      </div>
      <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-500 text-sm max-w-xs mb-6 leading-relaxed">
        {description}
      </p>
      {action && (
        <Link to={action} className="btn-primary">
          {actionLabel}
        </Link>
      )}
    </motion.div>
  )
}
