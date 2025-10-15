"use client"

import { useEffect, useState } from "react"
import { getUnreadMessageCount } from "@/lib/messaging-actions"

export function UnreadBadge() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const loadUnreadCount = async () => {
      const result = await getUnreadMessageCount()
      setUnreadCount(result.count)
    }

    loadUnreadCount()

    // Poll for new messages every 10 seconds
    const interval = setInterval(loadUnreadCount, 10000)

    return () => clearInterval(interval)
  }, [])

  if (unreadCount === 0) return null

  return (
    <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-700 animate-pulse" />
  )
}
