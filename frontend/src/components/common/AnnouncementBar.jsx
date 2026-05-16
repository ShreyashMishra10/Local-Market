import { useState } from 'react'
import { FiX, FiTag, FiTruck, FiZap } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

const ANNOUNCEMENTS = [
  { id: 1, icon: FiTruck,  text: 'Free delivery on orders above ₹500', link: '/products', color: 'from-emerald-500 to-teal-600' },
  { id: 2, icon: FiTag,    text: 'Use code WELCOME10 for 10% off your first order', link: '/products', color: 'from-primary-600 to-rose-500' },
  { id: 3, icon: FiZap,    text: '⚡ New vendors joining daily — Discover fresh local products!', link: '/vendors', color: 'from-amber-500 to-orange-600' },
]

export default function AnnouncementBar() {
  const [current, setCurrent] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const ann = ANNOUNCEMENTS[current]

  return (
    <div className={`bg-gradient-to-r ${ann.color} text-white text-sm relative overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Prev */}
          <button onClick={() => setCurrent((current - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length)} className="opacity-70 hover:opacity-100 text-xs hidden sm:block">‹</button>

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 flex-1 justify-center"
            >
              <ann.icon className="flex-shrink-0" />
              <Link to={ann.link} className="hover:underline font-medium text-center">
                {ann.text}
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Next */}
          <button onClick={() => setCurrent((current + 1) % ANNOUNCEMENTS.length)} className="opacity-70 hover:opacity-100 text-xs hidden sm:block">›</button>
        </div>

        <button onClick={() => setDismissed(true)} className="opacity-70 hover:opacity-100 flex-shrink-0 ml-2">
          <FiX className="text-base" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1 pb-1">
        {ANNOUNCEMENTS.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white' : 'bg-white/40'}`} />
        ))}
      </div>
    </div>
  )
}
