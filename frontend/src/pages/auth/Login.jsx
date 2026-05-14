import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FiMail, FiLock, FiEye, FiEyeOff, FiShoppingBag } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { fetchCart } from '../../store/cartSlice'

export default function Login() {
  const { login }    = useAuth()
  const navigate     = useNavigate()
  const location     = useLocation()
  const dispatch     = useDispatch()
  const from         = location.state?.from?.pathname || '/'

  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please fill all fields')
      return
    }
    setLoading(true)
    try {
      const user = await login(form)
      dispatch(fetchCart())
      toast.success(`Welcome back, ${user.name}!`)
      if (user.role === 'admin') navigate('/admin/dashboard')
      else if (user.role === 'vendor') navigate('/vendor/dashboard')
      else navigate(from)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiShoppingBag className="text-white text-2xl" />
          </div>
          <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white">Welcome back</h1>
          <p className="text-gray-500 mt-2">Sign in to your LocalMarket account</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="you@example.com"
                  className="input-field pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">Forgot password?</Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="••••••••"
                  className="input-field pl-11 pr-11"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials — remove before production */}
          {import.meta.env.DEV && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-sm">
              <p className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Demo Accounts:</p>
              <div className="space-y-1 text-blue-700 dark:text-blue-400 text-xs font-mono">
                <p>Admin: admin@localmarket.com / password123</p>
                <p>Vendor: ramesh@vendor.com / password123</p>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
