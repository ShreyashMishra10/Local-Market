import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '../../services/authService'
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.forgotPassword({ email })
      setSent(true)
    } catch {
      toast.error('Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 text-sm">
          <FiArrowLeft /> Back to Login
        </Link>

        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-3xl" />
              </div>
              <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-2">Check your email</h2>
              <p className="text-gray-500">We sent a password reset link to <strong>{email}</strong></p>
              <Link to="/login" className="btn-primary mt-6 inline-flex">Back to Login</Link>
            </div>
          ) : (
            <>
              <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-2">Forgot Password</h2>
              <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send a reset link</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="input-field pl-11" required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
