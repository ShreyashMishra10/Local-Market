import { Outlet } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useAuth } from '../../context/AuthContext'
import { useEffect } from 'react'
import { fetchCart } from '../../store/cartSlice'
import Navbar from './Navbar'
import Footer from './Footer'
import AnnouncementBar from './AnnouncementBar'
import OfflineBanner from './OfflineBanner'
import MobileBottomNav from './MobileBottomNav'
import ErrorBoundary from './ErrorBoundary'

export default function MainLayout() {
  const dispatch = useDispatch()
  const { user } = useAuth()

  useEffect(() => {
    if (user) dispatch(fetchCart())
  }, [user, dispatch])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <OfflineBanner />
      <AnnouncementBar />
      <Navbar />
      <main className="flex-grow pb-16 sm:pb-0">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
