import { useState, useEffect } from 'react'
import GlassCard from '../components/GlassCard'
import { Plus, Trash2 } from 'lucide-react'
import { api } from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function StaffManagement() {
  const { createStaff } = useAuthStore()
  const [staff, setStaff] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', login_id: '', password: '', tag_name: '' })

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    const data = await api.get('users', { eq: { role: 'staff' } })
    setStaff(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createStaff(formData)
      toast.success('Staff created')
      setShowForm(false)
      setFormData({ name: '', login_id: '', password: '', tag_name: '' })
      fetchStaff()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          <Plus size={18} /> Add Staff
        </button>
      </div>

      <GlassCard>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Login ID</th>
              <th className="text-left py-3 px-4">Tag</th>
              <th className="text-right py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-b border-white/10">
                <td className="py-3 px-4">{s.name}</td>
                <td className="py-3 px-4">{s.login_id}</td>
                <td className="py-3 px-4">{s.tag_name}</td>
                <td className="py-3 px-4 text-right">
                  <button className="p-1 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowForm(false)}>
          <div className="glass-card w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Create Staff Account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 glass bg-white/10 rounded-lg" required />
              <input type="text" placeholder="Login ID" value={formData.login_id} onChange={(e) => setFormData({...formData, login_id: e.target.value})} className="w-full p-2 glass bg-white/10 rounded-lg" required />
              <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full p-2 glass bg-white/10 rounded-lg" required />
              <input type="text" placeholder="@tag_name" value={formData.tag_name} onChange={(e) => setFormData({...formData, tag_name: e.target.value})} className="w-full p-2 glass bg-white/10 rounded-lg" required />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 glass rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}