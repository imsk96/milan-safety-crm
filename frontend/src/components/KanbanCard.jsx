import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function KanbanCard({ item, type }) {
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
      className="glass bg-white/10 dark:bg-gray-800/20 rounded-lg p-3 sm:p-3 cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow min-h-[44px]"
    >
      <p className="font-medium text-sm sm:text-base mb-1">{getTitle()}</p>
      <div className="flex items-center justify-between text-xs sm:text-sm opacity-70">
        <span>{item.assigned_to || 'Unassigned'}</span>
        {item.due_date && <span>{new Date(item.due_date).toLocaleDateString()}</span>}
      </div>
    </div>
  )
}