export default function KanbanColumn({ title, count, children }) {
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