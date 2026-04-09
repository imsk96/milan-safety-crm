import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { api } from '../services/api'
import GlassCard from '../components/GlassCard'
import KanbanBoard from '../components/KanbanBoard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, ClipboardList, Truck, CalendarCheck, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const { profile } = useAuthStore()
  const [stats, setStats] = useState({
    leads: { total: 0, new: 0, working: 0, closed: 0 },
    tasks: { total: 0, pending: 0, working: 0, done: 0 },
    dispatch: { total: 0, pending: 0, working: 0, done: 0 },
    visits: { total: 0, pending: 0, working: 0, done: 0 },
  })
  const [recentActivities, setRecentActivities] = useState([])

  useEffect(() => {
    fetchStats()
    fetchRecentActivities()
  }, [])

  const fetchStats = async () => {
    try {
      const [leads, tasks, dispatch, visits] = await Promise.all([
        api.get('leads'),
        api.get('tasks'),
        api.get('dispatch'),
        api.get('visits'),
      ])

      setStats({
        leads: {
          total: leads.length,
          new: leads.filter(l => l.status === 'New').length,
          working: leads.filter(l => l.status === 'Working').length,
          closed: leads.filter(l => l.status === 'Closed').length,
        },
        tasks: {
          total: tasks.length,
          pending: tasks.filter(t => t.status === 'Pending').length,
          working: tasks.filter(t => t.status === 'Working').length,
          done: tasks.filter(t => t.status === 'Done').length,
        },
        dispatch: {
          total: dispatch.length,
          pending: dispatch.filter(d => d.status === 'Pending').length,
          working: dispatch.filter(d => d.status === 'Working').length,
          done: dispatch.filter(d => d.status === 'Done').length,
        },
        visits: {
          total: visits.length,
          pending: visits.filter(v => v.status === 'Pending').length,
          working: visits.filter(v => v.status === 'Working').length,
          done: visits.filter(v => v.status === 'Done').length,
        },
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchRecentActivities = async () => {
    try {
      const [leads, tasks] = await Promise.all([
        api.get('leads', { order: { column: 'created_at', ascending: false }, limit: 5 }),
        api.get('tasks', { order: { column: 'created_at', ascending: false }, limit: 5 }),
      ])
      const combined = [
        ...leads.map(l => ({ ...l, type: 'lead' })),
        ...tasks.map(t => ({ ...t, type: 'task' })),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)
      setRecentActivities(combined)
    } catch (error) {
      console.error(error)
    }
  }

  const chartData = [
    { name: 'Leads', value: stats.leads.total },
    { name: 'Tasks', value: stats.tasks.total },
    { name: 'Dispatch', value: stats.dispatch.total },
    { name: 'Visits', value: stats.visits.total },
  ]

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome back, {profile?.name}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Leads Card */}
        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-70">Total Leads</p>
            <p className="text-3xl font-bold">{stats.leads.total}</p>
            <p className="text-xs mt-1">
              <span className="text-green-500">{stats.leads.new} new</span>
              {' · '}
              <span className="text-yellow-500">{stats.leads.working} working</span>
            </p>
          </div>
          <Users size={32} className="text-blue-500 opacity-70" />
        </GlassCard>

        {/* Tasks Card */}
        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-70">Total Tasks</p>
            <p className="text-3xl font-bold">{stats.tasks.total}</p>
            <p className="text-xs mt-1">
              <span className="text-yellow-500">{stats.tasks.pending} pending</span>
              {' · '}
              <span className="text-green-500">{stats.tasks.done} done</span>
            </p>
          </div>
          <ClipboardList size={32} className="text-green-500 opacity-70" />
        </GlassCard>

        {/* Dispatch Card */}
        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-70">Dispatch</p>
            <p className="text-3xl font-bold">{stats.dispatch.total}</p>
            <p className="text-xs mt-1">
              <span className="text-yellow-500">{stats.dispatch.pending} pending</span>
              {' · '}
              <span className="text-blue-400">{stats.dispatch.working} working</span>
              {' · '}
              <span className="text-green-500">{stats.dispatch.done} done</span>
            </p>
          </div>
          <Truck size={32} className="text-yellow-500 opacity-70" />
        </GlassCard>

        {/* Visits Card */}
        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-70">Visits</p>
            <p className="text-3xl font-bold">{stats.visits.total}</p>
            <p className="text-xs mt-1">
              <span className="text-yellow-500">{stats.visits.pending} pending</span>
              {' · '}
              <span className="text-blue-400">{stats.visits.working} working</span>
              {' · '}
              <span className="text-green-500">{stats.visits.done} done</span>
            </p>
          </div>
          <CalendarCheck size={32} className="text-purple-500 opacity-70" />
        </GlassCard>

      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} /> Overview
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" opacity={0.3} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Lead Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'New', value: stats.leads.new || 0 },
                    { name: 'Working', value: stats.leads.working || 0 },
                    { name: 'Closed', value: stats.leads.closed || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[0, 1, 2].map((index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Recent Activities */}
      <GlassCard>
        <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
        <div className="space-y-2">
          {recentActivities.length === 0 ? (
            <p className="text-center py-4 opacity-50">No recent activities</p>
          ) : (
            recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between py-2 border-b border-white/10 last:border-0"
              >
                <div>
                  <p className="font-medium">
                    {activity.type === 'lead' ? activity.company_name : activity.task}
                  </p>
                  <p className="text-sm opacity-70">
                    {activity.type} · {activity.status}
                  </p>
                </div>
                <span className="text-sm opacity-70">
                  {new Date(activity.created_at).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      {/* Kanban Board Preview */}
      {profile?.role === 'admin' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Task Kanban</h3>
          <KanbanBoard type="tasks" />
        </div>
      )}
    </div>
  )
}