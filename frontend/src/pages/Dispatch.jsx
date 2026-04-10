import { useState, useEffect, useCallback } from 'react'
import usePageRefresh from '../hooks/usePageRefresh'
import { api } from '../services/api'
import GlassCard from '../components/GlassCard'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { formatDate, getStatusColor } from '../utils/helpers'
import DispatchForm from '../components/forms/DispatchForm'

export default function Dispatch() {
  const { profile } = useAuthStore()

  const [dispatches, setDispatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDispatch, setEditingDispatch] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // ✅ FIX: stable function reference
  const fetchDispatches = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.get('dispatch', {
        order: { column: 'created_at', ascending: false }
      })
      setDispatches(data || [])
    } catch (error) {
      toast.error('Failed to fetch dispatches')
    } finally {
      setLoading(false)
    }
  }, [])

  // ✅ refresh hook (correct usage)
  usePageRefresh(() => {
    fetchDispatches()
  }, [fetchDispatches])

  // subscription kept separate (important)
  useEffect(() => {
    const unsubscribe = api.subscribe('dispatch', fetchDispatches)
    return () => unsubscribe()
  }, [fetchDispatches])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return

    try {
      await api.delete('dispatch', id)
      toast.success('Dispatch deleted')
      fetchDispatches()
    } catch (error) {
      toast.error('Delete failed')
    }
  }

  const filteredDispatches = dispatches.filter(dispatch => {
    const matchesSearch =
      dispatch.party_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispatch.location?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || dispatch.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Dispatch Management</h1>

        <button
          onClick={() => {
            setEditingDispatch(null)
            setShowForm(true)
          }}
          className="flex items-center justify-center gap-2 px-4 py-3 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg min-h-[44px]"
        >
          <Plus size={18} /> Add Dispatch
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
              placeholder="Search by party or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 sm:py-2 glass bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 sm:py-2 glass bg-white/10 rounded-lg text-base min-h-[44px]"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm sm:text-base">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Party Name</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Location</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Items</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Assigned To</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Contact</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Status</th>
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
              ) : filteredDispatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No dispatches found
                  </td>
                </tr>
              ) : (
                filteredDispatches.map((dispatch) => (
                  <tr
                    key={dispatch.id}
                    className="border-b border-white/10 hover:bg-white/5"
                  >
                    <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium">
                      {dispatch.party_name}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">{dispatch.location || '-'}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 max-w-[120px] sm:max-w-xs truncate">
                      {dispatch.items || '-'}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      {dispatch.assigned_to || '-'}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      {dispatch.contact_details || '-'}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                          dispatch.status
                        )}`}
                      >
                        {dispatch.status}
                      </span>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-right">
                      <button
                        onClick={() => {
                          setEditingDispatch(dispatch)
                          setShowForm(true)
                        }}
                        className="mr-2 p-1 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:p-0"
                      >
                        <Edit2 size={16} />
                      </button>

                      <button 
                        onClick={() => handleDelete(dispatch.id)}
                        className="p-1 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:p-0"
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
          <DispatchForm
            dispatch={editingDispatch}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              fetchDispatches()
              setShowForm(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}