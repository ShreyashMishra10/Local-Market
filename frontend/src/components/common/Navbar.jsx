import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import {
  FiShoppingCart, FiHeart, FiSearch, FiMenu, FiX,
  FiSun, FiMoon, FiBell, FiUser, FiLogOut, FiPackage,
  FiSettings, FiChevronDown, FiShoppingBag,
} from 'react-icons/fi'
import { getInitials } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout }   = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate           = useNavigate()
  const cartCount          = useSelector(s => s.cart.item_count)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [dropOpen, setDropOpen]   = useState(false)
  const [search, setSearch]       = useState('')
  const dropRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800">
      <div className="page-container">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center">
              <FiShoppingBag className="text-white text-lg" />
            </div>
            <span className="font-display font-bold text-xl hidden sm:block">
              <span className="text-gradient">Local</span>
              <span className="text-gray-800 dark:text-white">Market</span>
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products, vendors..."
                className="input-field pl-10 py-2.5 text-sm"
              />
            </div>
          </form>

          {/* Nav Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDark ? <FiSun className="text-lg" /> : <FiMoon className="text-lg" />}
            </button>

            {user ? (
              <>
                {/* Wishlist */}
                <Link to="/wishlist" className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <FiHeart className="text-lg" />
                </Link>

                {/* Cart */}
                <Link to="/cart" className="relative p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <FiShoppingCart className="text-lg" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={dropRef}>
                  <button
                    onClick={() => setDropOpen(!dropOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
                      {user.profile_picture
                        ? <img src={user.profile_picture} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        : getInitials(user.name)}
                    </div>
                    <FiChevronDown className="text-sm text-gray-500 hidden sm:block" />
                  </button>

                  {dropOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 animate-slide-down overflow-hidden">
                      <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <span className={`badge mt-1 ${user.role === 'vendor' ? 'badge-blue' : user.role === 'admin' ? 'badge-red' : 'badge-green'}`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="p-2">
                        {user.role === 'vendor' && (
                          <Link to="/vendor/dashboard" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl">
                            <FiSettings /> Vendor Dashboard
                          </Link>
                        )}
                        {user.role === 'admin' && (
                          <Link to="/admin/dashboard" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl">
                            <FiSettings /> Admin Dashboard
                          </Link>
                        )}
                        <Link to="/profile" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl">
                          <FiUser /> My Profile
                        </Link>
                        <Link to="/orders" onClick={() => setDropOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl">
                          <FiPackage /> My Orders
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl mt-1">
                          <FiLogOut /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-outline text-sm py-2 px-4">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
            >
              {menuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden pb-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="input-field pl-10 py-2.5 text-sm"
            />
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 animate-slide-down">
          <div className="page-container py-4 space-y-1">
            <NavLink to="/"         onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Home</NavLink>
            <NavLink to="/products" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Products</NavLink>
            <NavLink to="/vendors"  onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Vendors</NavLink>
            {!user && (
              <div className="flex gap-2 pt-2">
                <Link to="/login"    onClick={() => setMenuOpen(false)} className="btn-outline flex-1 text-center text-sm py-2">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 text-center text-sm py-2">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
