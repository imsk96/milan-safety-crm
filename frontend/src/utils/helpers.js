export const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const getStatusColor = (status) => {
  const map = {
    New: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    Working: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    Closed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    Pending: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    Done: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'Book Again': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

export const truncate = (str, n) => {
  return str?.length > n ? str.substr(0, n - 1) + '...' : str
}