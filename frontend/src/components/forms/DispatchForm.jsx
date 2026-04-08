import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { api } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function DispatchForm({ dispatch, onClose, onSuccess }) {
  const { profile } = useAuthStore()
  const [staffList, setStaffList] = useState([])
  const [formData, setFormData] = useState({
    location: '',
    items: '',
    assigned_to: profile?.tag_name || '',
    party_name: '',
    contact_details: '',
    remarks: '',
    status: 'Pending',
  })

  useEffect(() => {
    fetchStaff()
    if (dispatch) {
      setFormData({
        location: dispatch.location || '',
        items: dispatch.items || '',
        assigned_to: dispatch.assigned_to || '',
        party_name: dispatch.party_name || '',
        contact_details: dispatch.contact_details || '',
        remarks: dispatch.remarks || '',
        status: dispatch.status || 'Pending',
      })
    }
  }, [dispatch])

  const fetchStaff = async () => {
    const data = await api.get('users', { eq: { role: 'staff' } })
    setStaffList(data || [])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (dispatch?.id) {
        await api.update('dispatch', dispatch.id, formData)
        toast.success('Dispatch updated')
      } else {
        await api.create('dispatch', formData)
        toast.success('Dispatch created')
      }
      onSuccess()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{dispatch ? 'Edit Dispatch' : 'New Dispatch'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Party Name *</label>
            <input
              type="text"
              required
              value={formData.party_name}
              onChange={(e) => setFormData({ ...formData, party_name: e.target.value })}
              className="w-full p-2 glass bg-white/10 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-2 glass bg-white/10 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Contact Details</label>
            <input
              type="text"
              value={formData.contact_details}
              onChange={(e) => setFormData({ ...formData, contact_details: e.target.value })}
              className="w-full p-2 glass bg-white/10 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Items</label>
            <textarea
              value={formData.items}
              onChange={(e) => setFormData({ ...formData, items: e.target.value })}
              className="w-full p-2 glass bg-white/10 rounded-lg"
              rows="2"
              placeholder="List items to dispatch"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Assigned To</label>
            <select
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              className="w-full p-2 glass bg-white/10 rounded-lg"
            >
              <option value="">Unassigned</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.tag_name}>
                  {staff.name} ({staff.tag_name})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full p-2 glass bg-white/10 rounded-lg"
            >
              <option>Pending</option>
              <option>In Transit</option>
              <option>Delivered</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full p-2 glass bg-white/10 rounded-lg"
              rows="2"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 glass rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              {dispatch ? 'Update' : 'Create'} Dispatch
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}