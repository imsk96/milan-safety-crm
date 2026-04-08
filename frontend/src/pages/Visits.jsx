import { useState, useEffect } from 'react'
import { api } from '../services/api'
import GlassCard from '../components/GlassCard'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { formatDate, getStatusColor } from '../utils/helpers'
import VisitForm from '../components/forms/VisitForm'

export default function Visits() {
  const { profile } = useAuthStore()
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVisit, setEditingVisit] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchVisits()
    const unsubscribe = api.subscribe('visits', fetchVisits)
    return () => unsubscribe()
  }, [])

  const fetchVisits = async () => {
    try {
      const data = await api.get('visits', { order: { column: 'created_at', ascending: false } })
      setVisits(data)
    } catch (error) {
      toast.error('Failed to fetch visits')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return
    try {
      await api.delete('visits', id)
      toast.success('Visit deleted')
      fetchVisits()
    } catch (error) {
      toast.error('Delete failed')
    }
  }

  const filteredVisits = visits.filter(visit => {
    const matchesSearch = visit.party_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          visit.location?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || visit.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Visits Management</h1>
        <button
          onClick={() => { setEditingVisit(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          <Plus size={18} /> Add Visit
        </button>
      </div>

      <GlassCard>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by party or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 glass bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 glass bg-white/10 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4">Party Name</th>
                <th className="text-left py-3 px-4">Location</th>
                <th className="text-left py-3 px-4">Samples</th>
                <th className="text-left py-3 px-4">Assigned To</th>
                <th className="text-left py-3 px-4">Contact</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8">Loading...</td></tr>
              ) : filteredVisits.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">No visits found</td></tr>
              ) : (
                filteredVisits.map((visit) => (
                  <tr key={visit.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3 px-4 font-medium">{visit.party_name}</td>
                    <td className="py-3 px-4">{visit.location || '-'}</td>
                    <td className="py-3 px-4 max-w-xs truncate">{visit.samples || '-'}</td>
                    <td className="py-3 px-4">{visit.assigned_to || '-'}</td>
                    <td className="py-3 px-4">{visit.contact_details || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(visit.status)}`}>
                        {visit.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => { setEditingVisit(visit); setShowForm(true) }}
                        className="p-1 hover:text-blue-500 mr-2"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(visit.id)}
                        className="p-1 hover:text-red-500"
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
          <VisitForm
            visit={editingVisit}
            onClose={() => setShowForm(false)}
            onSuccess={() => { fetchVisits(); setShowForm(false) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}