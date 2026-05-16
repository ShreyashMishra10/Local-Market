import { useState, useEffect } from 'react'
import { FiWifiOff, FiWifi } from 'react-icons/fi'
import { AnimatePresence, motion } from 'framer-motion'

export default function OfflineBanner() {
  const [isOnline, setIsOnline]     = useState(navigator.onLine)
  const [showBack, setShowBack]     = useState(false)

  useEffect(() => {
    const goOffline = () => setIsOnline(false)
    const goOnline  = () => {
      setIsOnline(true)
      setShowBack(true)
      setTimeout(() => setShowBack(false), 3000)
    }

    window.addEventListener('offline', goOffline)
    window.addEventListener('online',  goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online',  goOnline)
    }
  }, [])

  return (
    <AnimatePresence>
      {(!isOnline || showBack) && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`fixed top-0 left-0 right-0 z-[9999] py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-medium text-white shadow-lg
            ${isOnline ? 'bg-green-500' : 'bg-gray-900'}`}
        >
          {isOnline
            ? <><FiWifi /> Back online — everything is working</>
            : <><FiWifiOff /> You're offline. Check your internet connection.</>
          }
        </motion.div>
      )}
    </AnimatePresence>
  )
}
