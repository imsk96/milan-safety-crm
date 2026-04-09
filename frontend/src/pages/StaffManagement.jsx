import { useState, useEffect } from 'react'
import GlassCard from '../components/GlassCard'
import { Plus, Trash2, User } from 'lucide-react'
import { api } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function StaffManagement() {
  const { createStaff, profile } = useAuthStore()
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    login_id: '',
    password: '',
    tag_name: '',
  })

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      // Same company ke saare staff fetch karo
      const data = await api.get('users', {
        eq: { role: 'staff' },
      })
      setStaff(data || [])
    } catch (error) {
      console.error('Fetch staff error:', error)
      toast.error('Failed to load staff')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    // Validation
    if (!formData.name.trim()) return toast.error('Name is required')
    if (!formData.login_id.trim()) return toast.error('Login ID is required')
    if (formData.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (!formData.tag_name.trim()) return toast.error('Tag name is required')

    setSubmitting(true)
    try {
      await createStaff(formData)
      toast.success('Staff member created successfully')
      setShowForm(false)
      setFormData({ name: '', login_id: '', password: '', tag_name: '' })
      // Thoda wait karo phir fetch karo (trigger time leta hai)
      setTimeout(() => fetchStaff(), 1000)
    } catch (error) {
      console.error('Create staff error:', error)
      toast.error(error.message || 'Failed to create staff')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (staffId) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return
    try {
      await api.delete('users', staffId)
      toast.success('Staff member removed')
      fetchStaff()
    } catch (error) {
      toast.error('Failed to remove staff member')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus size={18} /> Add Staff
        </button>
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
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 hover:text-red-500 transition-colors"
                        title="Remove staff"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>

      {/* Create Staff Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => !submitting && setShowForm(false)}
        >
          <div
            className="glass-card w-full max-w-md p-6 rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2">Create Staff Account</h2>
            <p className="text-sm opacity-60 mb-5">
              Staff will log in using their Login ID and password.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 opacity-70">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 glass bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
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
                  required
                />
                <p className="text-xs opacity-40 mt-1">
                  Login email will be: {formData.login_id || 'loginid'}@staff.internal
                </p>
              </div>

              <div>
                <label className="block text-sm mb-1 opacity-70">Password *</label>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-3 glass bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1 opacity-70">Tag Name *</label>
                <input
                  type="text"
                  placeholder="e.g. @rahul"
                  value={formData.tag_name}
                  onChange={(e) => setFormData({ ...formData, tag_name: e.target.value })}
                  className="w-full p-3 glass bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs opacity-40 mt-1">
                  Used in task assignment dropdowns
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !submitting && setShowForm(false)}
                  disabled={submitting}
                  className="px-4 py-2 glass rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Staff'
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