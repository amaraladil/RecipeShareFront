export const formatDate = (dateString: string) => {
  // Ensure the dateString is treated as UTC by adding 'Z' if not present
  const utcDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z'
  const date = new Date(utcDateString)
  const now = new Date()

  let diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  // If the difference is negative (future date), treat as 0
  if (diffInMinutes < 0) diffInMinutes = 0
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
  if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)}d ago`
  return date.toLocaleDateString()
}
