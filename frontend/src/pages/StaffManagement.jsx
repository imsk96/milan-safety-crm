import { useState, useEffect } from 'react'
import GlassCard from '../components/GlassCard'
import {
  Plus, Trash2, Edit2, User, X, Save,
  Copy, Check, Eye, EyeOff, Key,
} from 'lucide-react'
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

  // ✅ Naye staff ke liye "just created" credentials modal
  const [newCredentials, setNewCredentials] = useState(null)

  // ✅ Permanent credentials modal (kisi bhi staff ka)
  const [viewingCredentials, setViewingCredentials] = useState(null)

  // ✅ Per-row password reveal state
  const [revealedPasswords, setRevealedPasswords] = useState(new Set())

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

  const toggleRevealPassword = (staffId) => {
    setRevealedPasswords(prev => {
      const next = new Set(prev)
      if (next.has(staffId)) {
        next.delete(staffId)
      } else {
        next.add(staffId)
      }
      return next
    })
  }

  // ✅ Full login email construct karo
  const getLoginEmail = (loginId) => {
    if (!loginId) return '—'
    return `${loginId}@staff.internal`
  }

  const handleSubmit = async () => {
    if (submitting) return
    if (!formData.name.trim()) return toast.error('Name is required')
    if (!formData.login_id.trim()) return toast.error('Login ID is required')
    if (!editingStaff && formData.password.length < 6)
      return toast.error('Password must be at least 6 characters')
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
        const created = await createStaff(formData)

        // ✅ Full email ke saath credentials dikhao
        const processedLoginId = formData.login_id.toLowerCase().replace(/\s+/g, '.')
        setNewCredentials({
          name: formData.name,
          login_id: processedLoginId,
          email: `${processedLoginId}@staff.internal`,
          password: formData.password,
        })

        setShowForm(false)
        setFormData({ name: '', login_id: '', password: '', tag_name: '' })
        setTimeout(() => fetchStaff(), 1200)
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Login Email</th>
                  <th className="text-left py-3 px-4">Tag</th>
                  <th className="text-left py-3 px-4">Role</th>
                  {profile?.role === 'admin' && (
                    <>
                      <th className="text-left py-3 px-4">Password</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3 px-4 font-medium">{s.name}</td>

                    {/* ✅ Full login email */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-sm opacity-80">
                          {getLoginEmail(s.login_id)}
                        </span>
                        <button
                          onClick={() => handleCopy(getLoginEmail(s.login_id), `email-${s.id}`)}
                          className="p-1 hover:text-blue-400 transition-colors opacity-50 hover:opacity-100"
                          title="Copy login email"
                        >
                          {copied === `email-${s.id}`
                            ? <Check size={12} className="text-green-400" />
                            : <Copy size={12} />
                          }
                        </button>
                      </div>
                    </td>

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
                      <>
                        {/* ✅ Permanent password column */}
                        <td className="py-3 px-4">
                          {s.plain_password ? (
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-sm">
                                {revealedPasswords.has(s.id)
                                  ? s.plain_password
                                  : '••••••••'}
                              </span>
                              <button
                                onClick={() => toggleRevealPassword(s.id)}
                                className="p-1 hover:text-blue-400 transition-colors opacity-50 hover:opacity-100"
                                title={revealedPasswords.has(s.id) ? 'Hide' : 'Show password'}
                              >
                                {revealedPasswords.has(s.id)
                                  ? <EyeOff size={13} />
                                  : <Eye size={13} />
                                }
                              </button>
                              <button
                                onClick={() => handleCopy(s.plain_password, `pwd-${s.id}`)}
                                className="p-1 hover:text-blue-400 transition-colors opacity-50 hover:opacity-100"
                                title="Copy password"
                              >
                                {copied === `pwd-${s.id}`
                                  ? <Check size={12} className="text-green-400" />
                                  : <Copy size={12} />
                                }
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs opacity-30 italic">not saved</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          {/* View all credentials button */}
                          <button
                            onClick={() => setViewingCredentials(s)}
                            className="p-1.5 hover:text-yellow-400 transition-colors mr-1"
                            title="View credentials"
                          >
                            <Key size={15} />
                          </button>
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
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* ✅ Permanent Credentials Modal — kisi bhi staff ka credentials dekho */}
      {viewingCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Key size={18} className="text-yellow-400" />
                  {viewingCredentials.name}'s Credentials
                </h2>
                <p className="text-sm opacity-60 mt-1">Share these with the staff member</p>
              </div>
              <button
                onClick={() => setViewingCredentials(null)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Login Email */}
              <div className="p-3 glass bg-white/10 rounded-lg">
                <p className="text-xs opacity-50 mb-1">Login Email (Full)</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-medium text-sm">
                    {getLoginEmail(viewingCredentials.login_id)}
                  </span>
                  <button
                    onClick={() => handleCopy(getLoginEmail(viewingCredentials.login_id), 'vc-email')}
                    className="p-1.5 hover:text-blue-400 transition-colors flex-shrink-0"
                  >
                    {copied === 'vc-email'
                      ? <Check size={15} className="text-green-400" />
                      : <Copy size={15} />
                    }
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="p-3 glass bg-white/10 rounded-lg">
                <p className="text-xs opacity-50 mb-1">Password</p>
                {viewingCredentials.plain_password ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-medium">
                      {showPassword ? viewingCredentials.plain_password : '••••••••'}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 hover:text-blue-400 transition-colors"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        onClick={() => handleCopy(viewingCredentials.plain_password, 'vc-pwd')}
                        className="p-1.5 hover:text-blue-400 transition-colors"
                      >
                        {copied === 'vc-pwd'
                          ? <Check size={15} className="text-green-400" />
                          : <Copy size={15} />
                        }
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm opacity-40 italic">
                    Password not saved — reset karo Staff Settings se
                  </p>
                )}
              </div>

              {/* Copy All */}
              {viewingCredentials.plain_password && (
                <button
                  onClick={() => handleCopy(
                    `Login: ${getLoginEmail(viewingCredentials.login_id)}\nPassword: ${viewingCredentials.plain_password}`,
                    'vc-all'
                  )}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {copied === 'vc-all' ? <Check size={16} /> : <Copy size={16} />}
                  {copied === 'vc-all' ? 'Copied!' : 'Copy All Credentials'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ "Just Created" Credentials Modal */}
      {newCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-green-400">✅ Staff Created!</h2>
                <p className="text-sm opacity-60 mt-1">
                  Share these credentials with {newCredentials.name}
                </p>
              </div>
              <button
                onClick={() => { setNewCredentials(null); setShowPassword(false) }}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Full Login Email */}
              <div className="p-3 glass bg-white/10 rounded-lg">
                <p className="text-xs opacity-50 mb-1">Login Email (Full)</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-medium text-sm">{newCredentials.email}</span>
                  <button
                    onClick={() => handleCopy(newCredentials.email, 'nc-email')}
                    className="p-1.5 hover:text-blue-400 transition-colors flex-shrink-0"
                  >
                    {copied === 'nc-email'
                      ? <Check size={15} className="text-green-400" />
                      : <Copy size={15} />
                    }
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
                      onClick={() => handleCopy(newCredentials.password, 'nc-pwd')}
                      className="p-1.5 hover:text-blue-400 transition-colors"
                    >
                      {copied === 'nc-pwd'
                        ? <Check size={15} className="text-green-400" />
                        : <Copy size={15} />
                      }
                    </button>
                  </div>
                </div>
              </div>

              {/* Copy All */}
              <button
                onClick={() => handleCopy(
                  `Login: ${newCredentials.email}\nPassword: ${newCredentials.password}`,
                  'nc-all'
                )}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {copied === 'nc-all' ? <Check size={16} /> : <Copy size={16} />}
                {copied === 'nc-all' ? 'Copied!' : 'Copy All Credentials'}
              </button>

              <p className="text-xs opacity-40 text-center">
                ✅ Credentials permanently saved — Staff card mein Key icon se dobara dekh sakte ho
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
                    Staff will log in using their full email and password.
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
                  placeholder="e.g. rahul or rahul.sharma"
                  value={formData.login_id}
                  onChange={(e) => setFormData({ ...formData, login_id: e.target.value })}
                  className="w-full p-3 glass bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {!editingStaff && formData.login_id && (
                  <p className="text-xs text-blue-400 mt-1 font-mono">
                    Login email: {formData.login_id.toLowerCase().replace(/\s+/g, '.')}@staff.internal
                  </p>
                )}
                {!editingStaff && !formData.login_id && (
                  <p className="text-xs opacity-40 mt-1">
                    Login email: loginid@staff.internal
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