import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import { useDispatch } from 'react-redux'
import { useAuth } from '../../context/AuthContext'
import { useEffect } from 'react'
import { fetchCart } from '../../store/cartSlice'

export default function MainLayout() {
  const dispatch = useDispatch()
  const { user }  = useAuth()

  useEffect(() => {
    if (user) dispatch(fetchCart())
  }, [user, dispatch])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
