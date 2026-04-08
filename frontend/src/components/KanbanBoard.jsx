import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { motion } from 'framer-motion'
import { api } from '../services/api'
import KanbanColumn from './KanbanColumn'
import KanbanCard from './KanbanCard'
import { useAuthStore } from '../store/authStore'

export default function KanbanBoard({ type = 'tasks' }) {
  const { profile } = useAuthStore()
  const [items, setItems] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [loading, setLoading] = useState(true)

  const columns = {
    tasks: ['Pending', 'Working', 'Done', 'Book Again'],
    leads: ['New', 'Working', 'Closed'],
    dispatch: ['Pending', 'In Transit', 'Delivered'],
    visits: ['Scheduled', 'Completed', 'Cancelled'],
  }

  const columnList = columns[type] || columns.tasks

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    fetchItems()
    // Subscribe to realtime changes
    const unsubscribe = api.subscribe(type, () => {
      fetchItems()
    })
    return () => unsubscribe()
  }, [type])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const data = await api.get(type, {
        order: { column: 'created_at', ascending: false },
      })
      setItems(data)
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeItem = items.find((item) => item.id === active.id)
    const overColumn = over.data?.current?.column || over.id

    if (activeItem.status !== overColumn) {
      // Update status in DB
      try {
        await api.update(type, activeItem.id, { status: overColumn })
        // Optimistic update
        setItems((prev) =>
          prev.map((item) =>
            item.id === activeItem.id ? { ...item, status: overColumn } : item
          )
        )
      } catch (error) {
        console.error('Failed to update status:', error)
      }
    }
  }

  const getColumnItems = (column) => {
    return items.filter((item) => item.status === column)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columnList.map((column) => (
          <SortableContext
            key={column}
            id={column}
            items={getColumnItems(column).map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <KanbanColumn title={column} count={getColumnItems(column).length}>
              {getColumnItems(column).map((item) => (
                <KanbanCard key={item.id} item={item} type={type} />
              ))}
            </KanbanColumn>
          </SortableContext>
        ))}
      </div>

      <DragOverlay>
        {activeId ? (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1.05 }}
            className="glass-card p-4 shadow-2xl"
          >
            <p className="font-medium">
              {items.find((i) => i.id === activeId)?.task ||
                items.find((i) => i.id === activeId)?.company_name}
            </p>
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

// Create KanbanColumn.jsx
export function KanbanColumn({ title, count, children }) {
  return (
    <div className="flex-shrink-0 w-80 glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-sm bg-white/30 dark:bg-gray-800/50 px-2 py-1 rounded-full">
          {count}
        </span>
      </div>
      <div className="space-y-3 min-h-[200px]">{children}</div>
    </div>
  )
}

// Create KanbanCard.jsx
export function KanbanCard({ item, type }) {
  const { useSortable } = require('@dnd-kit/sortable')
  const { CSS } = require('@dnd-kit/utilities')
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getTitle = () => {
    if (type === 'leads') return item.company_name
    if (type === 'tasks') return item.task
    if (type === 'dispatch') return item.party_name
    return item.party_name || item.task
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="glass bg-white/10 dark:bg-gray-800/20 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow"
    >
      <p className="font-medium text-sm mb-1">{getTitle()}</p>
      <div className="flex items-center justify-between text-xs opacity-70">
        <span>{item.assigned_to || 'Unassigned'}</span>
        {item.due_date && <span>{new Date(item.due_date).toLocaleDateString()}</span>}
      </div>
    </div>
  )
}