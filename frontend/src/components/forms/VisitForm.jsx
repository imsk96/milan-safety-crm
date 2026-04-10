import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { api } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function VisitForm({ visit, onClose, onSuccess }) {
  const { profile } = useAuthStore()
  const [staffList, setStaffList] = useState([])
  const [formData, setFormData] = useState({
    location: '',
    samples: '',
    assigned_to: profile?.tag_name || '',
    party_name: '',
    contact_details: '',
    remarks: '',
    status: 'Scheduled',
  })

  useEffect(() => {
    fetchStaff()
    if (visit) {
      setFormData({
        location: visit.location || '',
        samples: visit.samples || '',
        assigned_to: visit.assigned_to || '',
        party_name: visit.party_name || '',
        contact_details: visit.contact_details || '',
        remarks: visit.remarks || '',
        status: visit.status || 'Scheduled',
      })
    }
  }, [visit])

  const fetchStaff = async () => {
    const data = await api.get('users', { eq: { role: 'staff' } })
    setStaffList(data || [])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (visit?.id) {
        await api.update('visits', visit.id, formData)
        toast.success('Visit updated')
      } else {
        await api.create('visits', formData)
        toast.success('Visit created')
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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold">{visit ? 'Edit Visit' : 'New Visit'}</h2>
          <button onClick={onClose} className="p-2 sm:p-1 hover:bg-white/20 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm mb-1">Party Name *</label>
            <input
              type="text"
              required
              value={formData.party_name}
              onChange={(e) => setFormData({ ...formData, party_name: e.target.value })}
              className="w-full p-3 sm:p-2 glass bg-white/10 rounded-lg text-base"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-3 sm:p-2 glass bg-white/10 rounded-lg text-base"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm mb-1">Contact Details</label>
            <input
              type="text"
              value={formData.contact_details}
              onChange={(e) => setFormData({ ...formData, contact_details: e.target.value })}
              className="w-full p-3 sm:p-2 glass bg-white/10 rounded-lg text-base"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm mb-1">Samples</label>
            <textarea
              value={formData.samples}
              onChange={(e) => setFormData({ ...formData, samples: e.target.value })}
              className="w-full p-3 sm:p-2 glass bg-white/10 rounded-lg text-base"
              rows="2"
              placeholder="Samples to show/deliver"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm mb-1">Assigned To</label>
            <select
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              className="w-full p-3 sm:p-2 glass bg-white/10 rounded-lg text-base"
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
            <label className="block text-xs sm:text-sm mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full p-3 sm:p-2 glass bg-white/10 rounded-lg text-base"
            >
              <option>Scheduled</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm mb-1">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full p-3 sm:p-2 glass bg-white/10 rounded-lg text-base"
              rows="2"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 sm:pt-4">
            <button type="button" onClick={onClose} className="px-4 py-3 sm:px-4 sm:py-2 glass rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-4 py-3 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg">
              {visit ? 'Update' : 'Create'} Visit
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}