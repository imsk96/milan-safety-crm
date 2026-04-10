import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { api } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import useFormProtection from '../../hooks/useFormProtection'

export default function LeadForm({ lead, onClose, onSuccess }) {
  const { profile } = useAuthStore()
  const [staffList, setStaffList] = useState([])
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    phone: '',
    gst_no: '',
    address: '',
    product_required: '',
    quantity: '',
    next_action: '',
    follow_up_date: '',
    assigned_to: profile?.tag_name || '',
    status: 'New',
  })

  const formKey = lead ? `lead-edit-${lead.id}` : 'lead-new'
  const { confirmClose, clearSavedData, restoredData } = useFormProtection({
    formKey,
    formData,
    enabled: true,
  })

  useEffect(() => {
    if (profile?.company_id) {
      fetchStaff()
    }

    if (lead) {
      setFormData({
        company_name: lead.company_name || '',
        contact_name: lead.contact_name || '',
        phone: lead.phone || '',
        gst_no: lead.gst_no || '',
        address: lead.address || '',
        product_required: lead.product_required || '',
        quantity: lead.quantity || '',
        next_action: lead.next_action || '',
        follow_up_date: lead.follow_up_date || '',
        assigned_to: lead.assigned_to || '',
        status: lead.status || 'New',
      })
    }
  }, [lead, profile])

  useEffect(() => {
    if (restoredData) {
      setFormData(prev => ({ ...prev, ...restoredData }))
      toast('Unsaved changes restored', { icon: '⚠️' })
    }
  }, [restoredData])

  const fetchStaff = async () => {
    try {
      const data = await api.get('users')
      // sirf staff + admin dono allow (so dropdown empty na rahe)
      const filtered = (data || []).filter(
        (user) => user.role === 'staff' || user.role === 'admin'
      )

      setStaffList(filtered)
    } catch (err) {
      console.error('fetchStaff error:', err)
      toast.error('Failed to load staff list')
    }
  }

  const handleClose = useCallback(async () => {
    const shouldClose = await confirmClose()
    if (shouldClose) {
      onClose()
    }
  }, [confirmClose, onClose])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [handleClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (lead?.id) {
        await api.update('leads', lead.id, formData)
        toast.success('Lead updated')
      } else {
        await api.create('leads', {...formData,
          company_id:profile.company_id,})
        toast.success('Lead created')
      }
      clearSavedData()
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
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold">{lead ? 'Edit Lead' : 'New Lead'}</h2>
          <button onClick={handleClose} className="p-2 sm:p-1 hover:bg-white/20 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full p-3 sm:p-2 glass bg-white/10 rounded-lg text-base"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm mb-1">Contact Name</label>
              <input
                type="text"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                className="w-full p-3 sm:p-2 glass bg-white/10 rounded-lg text-base"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 sm:p-2 glass bg-white/10 rounded-lg text-base"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm mb-1">GST No</label>
              <input
                type="text"
                value={formData.gst_no}
                onChange={(e) => setFormData({ ...formData, gst_no: e.target.value })}
                className="w-full p-3 sm:p-2 glass bg-white/10 rounded-lg text-base"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm mb-1">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-3 sm:p-2 glass bg-white/10 rounded-lg text-base"
                rows="2"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm mb-1">Product Required</label>
              <input
                type="text"
                value={formData.product_required}
                onChange={(e) => setFormData({ ...formData, product_required: e.target.value })}
                className="w-full p-3 sm:p-2 glass bg-white/10 rounded-lg text-base"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm mb-1">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full p-3 sm:p-2 glass bg-white/10 rounded-lg text-base"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm mb-1">Next Action</label>
              <select
                value={formData.next_action}
                onChange={(e) => setFormData({ ...formData, next_action: e.target.value })}
                className="w-full p-3 sm:p-2 glass bg-white/10 rounded-lg text-base"
              >
                <option value="">Select</option>
                <option>Send Quotation</option>
                <option>Send PI</option>
                <option>Create Tax Invoice</option>
                <option>Make Visit</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm mb-1">Follow-up Date</label>
              <input
                type="date"
                value={formData.follow_up_date}
                onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                className="w-full p-3 sm:p-2 glass bg-white/10 rounded-lg text-base"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm mb-1">Assign To</label>
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
                <option>New</option>
                <option>Working</option>
                <option>Closed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 sm:pt-4">
            <button type="button" onClick={handleClose} className="px-4 py-3 sm:px-4 sm:py-2 glass rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-4 py-3 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg">
              {lead ? 'Update' : 'Create'} Lead
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}