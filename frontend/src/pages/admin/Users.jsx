import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import { formatDate } from '../../utils/helpers'
import { FiSearch, FiSlash, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole]     = useState('')

  const load = () => {
    setLoading(true)
    adminService.getUsers({ search, role })
      .then(r => setUsers(r.data.data || []))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search, role])

  const handleBan = async (id) => {
    try {
      const res = await adminService.banUser(id)
      load()
      toast.success(res.data.message)
    } catch { toast.error('Failed') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return
    try {
      await adminService.deleteUser(id)
      load()
      toast.success('User deleted')
    } catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white">User Management</h1>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="input-field pl-9 py-2 text-sm" />
        </div>
        <select value={role} onChange={e => setRole(e.target.value)} className="input-field py-2 text-sm w-36">
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  {['User', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${u.role === 'admin' ? 'badge-red' : u.role === 'vendor' ? 'badge-blue' : 'badge-green'}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${u.is_active ? 'badge-green' : 'badge-red'}`}>{u.is_active ? 'Active' : 'Banned'}</span>
                    </td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <div className="flex gap-1.5">
                          <button onClick={() => handleBan(u._id)} title={u.is_active ? 'Ban' : 'Unban'} className="p-1.5 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg">
                            <FiSlash className="text-sm" />
                          </button>
                          <button onClick={() => handleDelete(u._id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                            <FiTrash2 className="text-sm" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
