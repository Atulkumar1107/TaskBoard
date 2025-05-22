"use client"

import { useBoard } from "@/context/BoardContext"
import { Users } from "lucide-react"

export default function UserPresence() {
  const { onlineUsers } = useBoard()

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm">
      <Users size={16} className="text-gray-500 dark:text-gray-400" />
      <span className="text-sm font-medium">
        {onlineUsers} {onlineUsers === 1 ? "user" : "users"} online
      </span>
    </div>
  )
}
