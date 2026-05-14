import { Outlet, NavLink, Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import {
  FiGrid, FiPackage, FiShoppingBag, FiBarChart2, FiUser,
  FiMenu, FiX, FiSun, FiMoon, FiLogOut, FiShoppingCart, FiHome,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { getInitials } from '../../utils/helpers'

const vendorLinks = [
  { to: '/vendor/dashboard', icon: FiGrid,      label: 'Dashboard' },
  { to: '/vendor/products',  icon: FiPackage,   label: 'Products' },
  { to: '/vendor/orders',    icon: FiShoppingBag, label: 'Orders' },
  { to: '/vendor/analytics', icon: FiBarChart2, label: 'Analytics' },
  { to: '/vendor/profile',   icon: FiUser,      label: 'Profile' },
]

export default function DashboardLayout() {
  const { user, logout }    = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate            = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/')
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900
        border-r border-gray-100 dark:border-gray-800 transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-auto
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <FiShoppingCart className="text-white" />
              </div>
              <span className="font-display font-bold text-lg text-gray-900 dark:text-white">
                <span className="text-primary-600">Vendor</span> Portal
              </span>
            </Link>
          </div>

          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {vendorLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <link.icon className="text-lg flex-shrink-0" />
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
            <Link to="/" className="sidebar-link">
              <FiHome /> Back to Store
            </Link>
            <button onClick={handleLogout} className="sidebar-link text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 h-16 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden">
            {sidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
              {isDark ? <FiSun /> : <FiMoon />}
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
