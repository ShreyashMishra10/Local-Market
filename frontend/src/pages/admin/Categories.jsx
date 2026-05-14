import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import { FiPlus, FiEdit, FiTrash2, FiX, FiSave } from 'react-icons/fi'
import toast from 'react-hot-toast'

const ICONS = ['🛒', '👗', '📱', '🏺', '🍽️', '🛋️', '💄', '📚', '🎨', '⚽', '🧴', '🌿']

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(false)
  const [saving, setSaving]         = useState(false)
  const [editing, setEditing]       = useState(null)
  const [form, setForm] = useState({ name: '', description: '', icon: '🛒', sort_order: 0 })

  const load = () => {
    setLoading(true)
    adminService.getCategories()
      .then(r => setCategories(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', description: '', icon: '🛒', sort_order: 0 })
    setModal(true)
  }

  const openEdit = (cat) => {
    setEditing(cat._id)
    setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '🛒', sort_order: cat.sort_order || 0 })
    setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await adminService.updateCategory(editing, form)
        toast.success('Category updated')
      } else {
        await adminService.createCategory(form)
        toast.success('Category created')
      }
      setModal(false)
      load()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) Object.values(errors).flat().forEach(m => toast.error(m))
      else toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return
    try {
      await adminService.deleteCategory(id)
      load()
      toast.success('Deleted')
    } catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Categories</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <FiPlus /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(cat => (
            <div key={cat._id} className="card p-5 flex items-center gap-4">
              <span className="text-3xl">{cat.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{cat.name}</p>
                <p className="text-xs text-gray-400">Sort: {cat.sort_order}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(cat)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><FiEdit className="text-sm" /></button>
                <button onClick={() => handleDelete(cat._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><FiTrash2 className="text-sm" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">
                {editing ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(icon => (
                    <button key={icon} type="button" onClick={() => setForm({...form, icon})}
                      className={`text-2xl p-2 rounded-xl transition-all ${form.icon === icon ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="input-field resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: parseInt(e.target.value)})} className="input-field" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(false)} className="btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <FiSave /> {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
