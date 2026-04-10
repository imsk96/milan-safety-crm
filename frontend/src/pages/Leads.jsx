import { useState, useEffect, useCallback } from 'react'
import usePageRefresh from '../hooks/usePageRefresh'
import { api } from '../services/api'
import GlassCard from '../components/GlassCard'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { formatDate, getStatusColor } from '../utils/helpers'
import LeadForm from '../components/forms/LeadForm'

export default function Leads() {
  const { profile } = useAuthStore()

  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // ✅ FIX: stable function
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true)

      const data = await api.get('leads', {
        order: { column: 'created_at', ascending: false }
      })

      setLeads(data || [])
    } catch (error) {
      toast.error('Failed to fetch leads')
    } finally {
      setLoading(false)
    }
  }, [])

  // ✅ FIXED refresh hook
  usePageRefresh(() => {
    fetchLeads()
  }, [fetchLeads])

  useEffect(() => {
    fetchLeads()

    const unsubscribe = api.subscribe('leads', fetchLeads)
    return () => unsubscribe()
  }, [fetchLeads])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return

    try {
      await api.delete('leads', id)
      toast.success('Lead deleted')
      fetchLeads()
    } catch (error) {
      toast.error('Delete failed')
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contact_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || lead.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Leads Management</h1>

        <button
          onClick={() => {
            setEditingLead(null)
            setShowForm(true)
          }}
          className="flex items-center justify-center gap-2 px-4 py-3 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px]"
        >
          <Plus size={18} /> Add Lead
        </button>
      </div>

      <GlassCard>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 sm:py-2 glass bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 sm:py-2 glass bg-white/10 rounded-lg focus:outline-none text-base min-h-[44px]"
          >
            <option value="all">All Status</option>
            <option value="New">New</option>
            <option value="Working">Working</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm sm:text-base">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Company</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Contact</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Product</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Assigned To</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Status</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Follow-up</th>
                <th className="text-right py-2 sm:py-3 px-2 sm:px-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    Loading...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No leads found
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-white/10 hover:bg-white/5"
                  >
                    <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium">
                      {lead.company_name}
                    </td>

                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <div>{lead.contact_name}</div>
                      <div className="text-xs sm:text-sm opacity-70">{lead.phone}</div>
                    </td>

                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      {lead.product_required}
                    </td>

                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      {lead.assigned_to || '-'}
                    </td>

                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                          lead.status
                        )}`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      {formatDate(lead.follow_up_date)}
                    </td>

                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-right">
                      <button
                        onClick={() => {
                          setEditingLead(lead)
                          setShowForm(true)
                        }}
                        className="p-1 hover:text-blue-500 mr-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="p-1 hover:text-red-500 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <AnimatePresence>
        {showForm && (
          <LeadForm
            lead={editingLead}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              fetchLeads()
              setShowForm(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}