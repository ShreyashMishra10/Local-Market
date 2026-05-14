import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiSave } from 'react-icons/fi'
import { getInitials } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [tab, setTab]         = useState('profile')
  const [saving, setSaving]   = useState(false)

  const [form, setForm] = useState({
    name:    user?.name || '',
    phone:   user?.phone || '',
    address: user?.address || '',
    city:    user?.city || '',
  })

  const [pwdForm, setPwdForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await authService.updateProfile(form)
      updateUser(res.data.user)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (pwdForm.password !== pwdForm.password_confirmation) {
      toast.error('Passwords do not match')
      return
    }
    setSaving(true)
    try {
      await authService.changePassword(pwdForm)
      toast.success('Password changed!')
      setPwdForm({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-container py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="card p-6 mb-6 flex items-center gap-5">
          <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-display font-bold text-3xl">
            {user?.profile_picture
              ? <img src={user.profile_picture} alt="" className="w-full h-full rounded-2xl object-cover" />
              : getInitials(user?.name)}
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">{user?.name}</h1>
            <p className="text-gray-500">{user?.email}</p>
            <span className={`badge mt-1 ${user?.role === 'vendor' ? 'badge-blue' : 'badge-green'}`}>{user?.role}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="card p-1 flex mb-6">
          {['profile', 'password'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all
                ${tab === t ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              {t === 'profile' ? '👤 Profile' : '🔐 Password'}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="card p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field pl-11" />
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field pl-11" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={user?.email} disabled className="input-field pl-11 opacity-60 cursor-not-allowed" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City</label>
                <div className="relative">
                  <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="input-field pl-11" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Address</label>
                <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="input-field" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {tab === 'password' && (
          <form onSubmit={handleChangePassword} className="card p-6 space-y-4">
            {[
              { label: 'Current Password', field: 'current_password' },
              { label: 'New Password',     field: 'password' },
              { label: 'Confirm Password', field: 'password_confirmation' },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" value={pwdForm[field]} onChange={e => setPwdForm({...pwdForm, [field]: e.target.value})} className="input-field pl-11" required />
                </div>
              </div>
            ))}
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <FiLock /> {saving ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
