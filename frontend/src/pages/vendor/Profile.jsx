import { useEffect, useState } from 'react'
import { vendorService } from '../../services/vendorService'
import { FiSave, FiShoppingBag } from 'react-icons/fi'
import toast from 'react-hot-toast'

const CATEGORIES = ['Groceries', 'Clothing', 'Electronics', 'Handicrafts', 'Food & Dining', 'Furniture', 'Beauty', 'Books', 'Other']

export default function VendorProfile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [form, setForm] = useState({
    shop_name: '', description: '', shop_address: '', city: '',
    phone: '', category: '', shop_logo: '', banner_image: '',
  })

  useEffect(() => {
    vendorService.getProfile()
      .then(r => {
        const v = r.data
        setForm({
          shop_name:    v.shop_name || '',
          description:  v.description || '',
          shop_address: v.shop_address || '',
          city:         v.city || '',
          phone:        v.phone || '',
          category:     v.category || '',
          shop_logo:    v.shop_logo || '',
          banner_image: v.banner_image || '',
        })
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await vendorService.updateProfile(form)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="skeleton h-96 rounded-2xl" />

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white flex items-center gap-2">
        <FiShoppingBag className="text-primary-600" /> Store Profile
      </h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Branding */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Store Branding</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Shop Name *</label>
              <input type="text" value={form.shop_name} onChange={update('shop_name')} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Logo URL</label>
              <input type="url" value={form.shop_logo} onChange={update('shop_logo')} placeholder="https://..." className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Banner URL</label>
              <input type="url" value={form.banner_image} onChange={update('banner_image')} placeholder="https://..." className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea value={form.description} onChange={update('description')} rows={4} placeholder="Tell customers about your shop..." className="input-field resize-none" />
          </div>
        </div>

        {/* Contact */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Contact & Location</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
              <select value={form.category} onChange={update('category')} className="input-field">
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
              <input type="tel" value={form.phone} onChange={update('phone')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City *</label>
              <input type="text" value={form.city} onChange={update('city')} className="input-field" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Shop Address</label>
            <textarea value={form.shop_address} onChange={update('shop_address')} rows={2} className="input-field resize-none" />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
