export default function KanbanColumn({ title, count, children }) {
  return (
    <div className="flex-shrink-0 w-[85vw] sm:w-72 md:w-80 lg:w-80 glass rounded-xl p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="font-semibold text-sm sm:text-base">{title}</h3>
        <span className="text-xs sm:text-sm bg-white/30 dark:bg-gray-800/50 px-2 py-1 rounded-full">
          {count}
        </span>
      </div>
      <div className="space-y-2 sm:space-y-3 min-h-[150px] sm:min-h-[200px]">{children}</div>
    </div>
  )
}