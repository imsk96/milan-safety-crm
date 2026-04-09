import { useState, useEffect } from 'react'
import GlassCard from '../components/GlassCard'
import { Plus, Trash2, Edit2, User, X, Save, Copy, Check, Eye, EyeOff } from 'lucide-react'
import { api } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function StaffManagement() {
  const { createStaff, deleteStaff, profile } = useAuthStore()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [newCredentials, setNewCredentials] = useState(null) // ✅ naye staff credentials
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    login_id: '',
    password: '',
    tag_name: '',
  })

  useEffect(() => { fetchStaff() }, [])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const data = await api.get('users', { eq: { role: 'staff' } })
      setStaff(data || [])
    } catch (error) {
      console.error('Fetch staff error:', error)
      toast.error('Failed to load staff')
    } finally {
      setLoading(false)
    }
  }

  const openCreateForm = () => {
    setEditingStaff(null)
    setFormData({ name: '', login_id: '', password: '', tag_name: '' })
    setShowForm(true)
  }

  const openEditForm = (s) => {
    setEditingStaff(s)
    setFormData({ name: s.name || '', login_id: s.login_id || '', password: '', tag_name: s.tag_name || '' })
    setShowForm(true)
  }

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const handleSubmit = async () => {
    if (submitting) return
    if (!formData.name.trim()) return toast.error('Name is required')
    if (!formData.login_id.trim()) return toast.error('Login ID is required')
    if (!editingStaff && formData.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (!formData.tag_name.trim()) return toast.error('Tag name is required')

    setSubmitting(true)
    try {
      if (editingStaff) {
        await api.update('users', editingStaff.id, {
          name: formData.name,
          login_id: formData.login_id,
          tag_name: formData.tag_name,
        })
        toast.success('Staff updated successfully')
        setShowForm(false)
        setEditingStaff(null)
        setFormData({ name: '', login_id: '', password: '', tag_name: '' })
        setTimeout(() => fetchStaff(), 800)
      } else {
        await createStaff(formData)
        // ✅ Credentials save karo dikhane ke liye
        setNewCredentials({
          name: formData.name,
          login_id: formData.login_id,
          password: formData.password,
          email: `${formData.login_id.toLowerCase().replace(/\s+/g, '.')}@staff.internal`,
        })
        setShowForm(false)
        setFormData({ name: '', login_id: '', password: '', tag_name: '' })
        setTimeout(() => fetchStaff(), 800)
      }
    } catch (error) {
      console.error('Staff submit error:', error)
      toast.error(error.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (staffId, staffName) => {
    if (!confirm(`Are you sure you want to remove "${staffName}"?`)) return
    try {
      setDeletingId(staffId)
      await deleteStaff(staffId)
      toast.success('Staff member removed')
      fetchStaff()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error.message || 'Failed to remove staff member')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        {profile?.role === 'admin' && (
          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus size={18} /> Add Staff
          </button>
        )}
      </div>

      <GlassCard>
        {loading ? (
          <div className="text-center py-8 opacity-50">Loading staff...</div>
        ) : staff.length === 0 ? (
          <div className="text-center py-8 opacity-50">
            <User size={40} className="mx-auto mb-2 opacity-30" />
            <p>No staff members yet</p>
            <p className="text-sm mt-1">Click "Add Staff" to create a staff account</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Login ID</th>
                <th className="text-left py-3 px-4">Tag</th>
                <th className="text-left py-3 px-4">Role</th>
                {profile?.role === 'admin' && (
                  <th className="text-right py-3 px-4">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-3 px-4 font-medium">{s.name}</td>
                  <td className="py-3 px-4 opacity-70">{s.login_id}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                      {s.tag_name}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-gray-500/20 rounded text-xs capitalize">
                      {s.role}
                    </span>
                  </td>
                  {profile?.role === 'admin' && (
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openEditForm(s)}
                        className="p-1.5 hover:text-blue-400 transition-colors mr-1"
                        title="Edit staff"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id, s.name)}
                        disabled={deletingId === s.id}
                        className="p-1.5 hover:text-red-500 transition-colors disabled:opacity-40"
                        title="Remove staff"
                      >
                        {deletingId === s.id ? (
                          <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin inline-block" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>

      {/* ✅ New Staff Credentials Modal */}
      {newCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-green-400">✅ Staff Created!</h2>
                <p className="text-sm opacity-60 mt-1">Share these credentials with {newCredentials.name}</p>
              </div>
              <button
                onClick={() => setNewCredentials(null)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Login ID */}
              <div className="p-3 glass bg-white/10 rounded-lg">
                <p className="text-xs opacity-50 mb-1">Login ID</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-medium">{newCredentials.login_id}</span>
                  <button
                    onClick={() => handleCopy(newCredentials.login_id, 'login_id')}
                    className="p-1.5 hover:text-blue-400 transition-colors flex-shrink-0"
                  >
                    {copied === 'login_id' ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="p-3 glass bg-white/10 rounded-lg">
                <p className="text-xs opacity-50 mb-1">Password</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-medium">
                    {showPassword ? newCredentials.password : '••••••••'}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 hover:text-blue-400 transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button
                      onClick={() => handleCopy(newCredentials.password, 'password')}
                      className="p-1.5 hover:text-blue-400 transition-colors"
                    >
                      {copied === 'password' ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Copy All */}
              <button
                onClick={() => handleCopy(
                  `Login ID: ${newCredentials.login_id}\nPassword: ${newCredentials.password}`,
                  'all'
                )}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {copied === 'all' ? <Check size={16} /> : <Copy size={16} />}
                {copied === 'all' ? 'Copied!' : 'Copy All Credentials'}
              </button>

              <p className="text-xs opacity-40 text-center">
                ⚠️ Save these credentials — password won't be shown again
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => !submitting && setShowForm(false)}
        >
          <div
            className="glass-card w-full max-w-md p-6 rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold">
                  {editingStaff ? 'Edit Staff' : 'Create Staff Account'}
                </h2>
                {!editingStaff && (
                  <p className="text-sm opacity-60 mt-1">
                    Staff will log in using their Login ID and password.
                  </p>
                )}
              </div>
              <button
                onClick={() => !submitting && setShowForm(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 opacity-70">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 glass bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 opacity-70">Login ID *</label>
                <input
                  type="text"
                  placeholder="e.g. rahul.sharma"
                  value={formData.login_id}
                  onChange={(e) => setFormData({ ...formData, login_id: e.target.value })}
                  className="w-full p-3 glass bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {!editingStaff && (
                  <p className="text-xs opacity-40 mt-1">
                    Login email: {formData.login_id || 'loginid'}@staff.internal
                  </p>
                )}
              </div>

              {!editingStaff && (
                <div>
                  <label className="block text-sm mb-1 opacity-70">Password *</label>
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-3 glass bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm mb-1 opacity-70">Tag Name *</label>
                <input
                  type="text"
                  placeholder="e.g. @rahul"
                  value={formData.tag_name}
                  onChange={(e) => setFormData({ ...formData, tag_name: e.target.value })}
                  className="w-full p-3 glass bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs opacity-40 mt-1">Used in task assignment dropdowns</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => !submitting && setShowForm(false)}
                  disabled={submitting}
                  className="px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {editingStaff ? 'Saving...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {editingStaff ? <Save size={16} /> : <Plus size={16} />}
                      {editingStaff ? 'Save Changes' : 'Create Staff'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}