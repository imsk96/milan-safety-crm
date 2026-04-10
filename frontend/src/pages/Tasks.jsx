import { useState, useEffect } from 'react'
import { api } from '../services/api'
import GlassCard from '../components/GlassCard'
import KanbanBoard from '../components/KanbanBoard'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { formatDate, getStatusColor } from '../utils/helpers'
import TaskForm from '../components/forms/TaskForm'

export default function Tasks() {
  const { profile } = useAuthStore()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState('kanban') // 'kanban' or 'list'

  useEffect(() => {
    fetchTasks()
    const unsubscribe = api.subscribe('tasks', fetchTasks)
    return () => unsubscribe()
  }, [])

  const fetchTasks = async () => {
    try {
      const data = await api.get('tasks', { order: { column: 'created_at', ascending: false } })
      setTasks(data)
    } catch (error) {
      toast.error('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return
    try {
      await api.delete('tasks', id)
      toast.success('Task deleted')
      fetchTasks()
    } catch (error) {
      toast.error('Delete failed')
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.task?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.location?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Tasks</h1>
        <div className="flex flex-wrap gap-2">
          <div className="flex">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 sm:px-4 py-2 sm:py-2 rounded-l-lg text-sm sm:text-base min-h-[44px] ${viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'glass'}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 sm:px-4 py-2 sm:py-2 rounded-r-lg text-sm sm:text-base min-h-[44px] ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'glass'}`}
            >
              List
            </button>
          </div>
          <button
            onClick={() => { setEditingTask(null); setShowForm(true) }}
            className="flex items-center justify-center gap-2 px-4 py-3 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg min-h-[44px] w-full sm:w-auto"
          >
            <Plus size={18} /> Add Task
          </button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <KanbanBoard type="tasks" />
      ) : (
        <GlassCard>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search tasks..."
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
              <option value="Working">Working</option>
              <option value="Done">Done</option>
              <option value="Book Again">Book Again</option>
            </select>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm sm:text-base">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Task</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Location</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Assigned To</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Due Date</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4">Status</th>
                  <th className="text-right py-2 sm:py-3 px-2 sm:px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
                ) : filteredTasks.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500">No tasks found</td></tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium">{task.task}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">{task.location || '-'}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">{task.assigned_to || '-'}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">{formatDate(task.due_date)}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-right">
                        <button
                          onClick={() => { setEditingTask(task); setShowForm(true) }}
                          className="p-1 hover:text-blue-500 mr-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
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
      )}

      <AnimatePresence>
        {showForm && (
          <TaskForm
            task={editingTask}
            onClose={() => setShowForm(false)}
            onSuccess={() => { fetchTasks(); setShowForm(false) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}