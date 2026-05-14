import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiShoppingBag, FiEye, FiEyeOff } from 'react-icons/fi'
import toast from 'react-hot-toast'

const CATEGORIES = ['Groceries', 'Clothing', 'Electronics', 'Handicrafts', 'Food & Dining', 'Furniture', 'Beauty', 'Books', 'Other']

export default function Register() {
  const { register }     = useAuth()
  const navigate         = useNavigate()
  const [params]         = useSearchParams()
  const initRole         = params.get('role') || 'customer'

  const [role, setRole]         = useState(initRole)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [form, setForm]         = useState({
    name: '', email: '', password: '', password_confirmation: '',
    phone: '', address: '', city: '',
    // Vendor fields
    shop_name: '', shop_address: '', category: '', description: '',
  })

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      const user = await register({ ...form, role })
      toast.success('Account created successfully!')
      if (user.role === 'vendor') navigate('/vendor/dashboard')
      else navigate('/')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        Object.values(errors).flat().forEach(msg => toast.error(msg))
      } else {
        toast.error(err.response?.data?.error || 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiShoppingBag className="text-white text-2xl" />
          </div>
          <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white">Create Account</h1>
          <p className="text-gray-500 mt-2">Join LocalMarket today</p>
        </div>

        {/* Role Toggle */}
        <div className="card p-1 flex mb-6">
          {['customer', 'vendor'].map(r => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize
                ${role === r ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              {r === 'vendor' ? '🏪 Become a Vendor' : '🛍️ Customer'}
            </button>
          ))}
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={form.name} onChange={update('name')} placeholder="John Doe" className="input-field pl-11" required />
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={form.phone} onChange={update('phone')} placeholder="+91 98765 43210" className="input-field pl-11" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address *</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" className="input-field pl-11" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password *</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={update('password')} placeholder="Min 8 chars" className="input-field pl-11 pr-11" required />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm *</label>
                <input type="password" value={form.password_confirmation} onChange={update('password_confirmation')} placeholder="••••••••" className="input-field" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City</label>
                <div className="relative">
                  <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={form.city} onChange={update('city')} placeholder="Mumbai" className="input-field pl-11" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Address</label>
                <input type="text" value={form.address} onChange={update('address')} placeholder="Street address" className="input-field" />
              </div>
            </div>

            {/* Vendor Fields */}
            {role === 'vendor' && (
              <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">🏪 Vendor Information</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Shop Name *</label>
                  <input type="text" value={form.shop_name} onChange={update('shop_name')} placeholder="Your Shop Name" className="input-field" required={role === 'vendor'} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
                    <select value={form.category} onChange={update('category')} className="input-field" required={role === 'vendor'}>
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Shop City *</label>
                    <input type="text" value={form.city} onChange={update('city')} placeholder="City" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Shop Address *</label>
                  <input type="text" value={form.shop_address} onChange={update('shop_address')} placeholder="Full shop address" className="input-field" required={role === 'vendor'} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={update('description')} placeholder="Tell customers about your shop..." rows={3} className="input-field resize-none" />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : `Create ${role === 'vendor' ? 'Vendor ' : ''}Account`}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
