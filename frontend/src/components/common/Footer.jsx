import { Link } from 'react-router-dom'
import { FiShoppingBag, FiMail, FiPhone, FiMapPin, FiFacebook, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 mt-auto">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <FiShoppingBag className="text-white text-lg" />
              </div>
              <span className="font-display font-bold text-xl text-white">LocalMarket</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Empowering local businesses to reach more customers. Shop from vendors in your community and support the local economy.
            </p>
            <div className="flex gap-3">
              {[FiFacebook, FiInstagram, FiTwitter, FiYoutube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-gray-800 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-colors">
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'All Products' },
                { to: '/vendors', label: 'Our Vendors' },
                { to: '/register?role=vendor', label: 'Become a Vendor' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-primary-400 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Categories</h3>
            <ul className="space-y-2.5 text-sm">
              {['Groceries', 'Clothing', 'Electronics', 'Handicrafts', 'Food & Dining', 'Furniture'].map(cat => (
                <li key={cat}>
                  <Link to={`/products?category=${cat.toLowerCase()}`} className="hover:text-primary-400 transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <FiMapPin className="text-primary-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400">Local Market Plaza, 123 Main Street, Mumbai, India</span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="text-primary-400 flex-shrink-0" />
                <a href="tel:+911234567890" className="hover:text-primary-400 transition-colors">+91 12345 67890</a>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-primary-400 flex-shrink-0" />
                <a href="mailto:support@localmarket.com" className="hover:text-primary-400 transition-colors">support@localmarket.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {year} LocalMarket. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
