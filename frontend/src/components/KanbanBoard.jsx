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
      try {
        await api.update(type, activeItem.id, { status: overColumn })
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