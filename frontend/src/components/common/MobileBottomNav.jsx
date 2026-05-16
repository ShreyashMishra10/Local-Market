import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '../../context/AuthContext'
import { FiHome, FiSearch, FiShoppingCart, FiPackage, FiUser } from 'react-icons/fi'

export default function MobileBottomNav() {
  const { user }    = useAuth()
  const cartCount   = useSelector(s => s.cart.item_count)

  const links = [
    { to: '/',         icon: FiHome,        label: 'Home' },
    { to: '/products', icon: FiSearch,      label: 'Shop' },
    { to: '/cart',     icon: FiShoppingCart,label: 'Cart',  badge: cartCount },
    { to: '/orders',   icon: FiPackage,     label: 'Orders', auth: true },
    { to: user ? '/profile' : '/login', icon: FiUser, label: user ? 'Profile' : 'Login' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 safe-area-pb">
      <div className="flex items-stretch">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative transition-colors
               ${isActive ? 'text-primary-600' : 'text-gray-400 dark:text-gray-500'}`
            }
          >
            <div className="relative">
              <link.icon className="text-xl" />
              {link.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-primary-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {link.badge > 9 ? '9+' : link.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
