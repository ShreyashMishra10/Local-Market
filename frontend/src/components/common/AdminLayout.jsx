import { Outlet, NavLink, Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import {
  FiGrid, FiUsers, FiPackage, FiShoppingBag, FiBarChart2,
  FiTag, FiPercent, FiMenu, FiX, FiSun, FiMoon, FiLogOut, FiHome, FiShield,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { getInitials } from '../../utils/helpers'

const adminLinks = [
  { to: '/admin/dashboard',  icon: FiGrid,      label: 'Dashboard' },
  { to: '/admin/users',      icon: FiUsers,     label: 'Users' },
  { to: '/admin/vendors',    icon: FiShield,    label: 'Vendors' },
  { to: '/admin/products',   icon: FiPackage,   label: 'Products' },
  { to: '/admin/orders',     icon: FiShoppingBag, label: 'Orders' },
  { to: '/admin/categories', icon: FiTag,       label: 'Categories' },
  { to: '/admin/coupons',    icon: FiPercent,   label: 'Coupons' },
  { to: '/admin/analytics',  icon: FiBarChart2, label: 'Analytics' },
]

export default function AdminLayout() {
  const { user, logout }        = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate                = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/')
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-gray-100
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-auto
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <FiShield className="text-white" />
              </div>
              <span className="font-display font-bold text-lg">
                <span className="text-primary-400">Admin</span> Panel
              </span>
            </div>
          </div>

          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-white truncate">{user?.name}</p>
                <span className="badge badge-red text-xs">Administrator</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {adminLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
                }
              >
                <link.icon className="text-lg flex-shrink-0" />
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-800 space-y-1">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
              <FiHome /> Back to Store
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/30 transition-all">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 h-16 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden">
            {sidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
          <h1 className="font-display font-semibold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
            {isDark ? <FiSun /> : <FiMoon />}
          </button>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
