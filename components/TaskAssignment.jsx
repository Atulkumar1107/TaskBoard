"use client"

import { useState } from "react"
import { useBoard } from "@/context/BoardContext"
import { X, User, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

export default function TaskAssignment({ task, onClose }) {
  const { assignTask } = useBoard()
  const [selectedUserId, setSelectedUserId] = useState(task.assignedTo || "")

  // Hardcoded user list to ensure it displays
  const usersList = [
    { id: "user-john", name: "John Smith" },
    { id: "user-sarah", name: "Sarah Johnson" },
    { id: "user-michael", name: "Michael Brown" },
    { id: "user-emily", name: "Emily Davis" },
    { id: "user-david", name: "David Wilson" },
    { id: "user-jessica", name: "Jessica Lee" },
    { id: "user-robert", name: "Robert Taylor" },
    { id: "user-amanda", name: "Amanda Clark" },
  ]

  const handleAssignTask = () => {
    assignTask(task.id, selectedUserId || null)
    onClose()
    toast.success(selectedUserId ? "Task assigned" : "Task unassigned", {
      position: "top-center",
    })
  }

  const handleRemoveAssignment = () => {
    assignTask(task.id, null)
    onClose()
    toast.success("Assignment removed", {
      position: "top-center",
    })
  }

  return (
    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Assign Task</h4>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <User size={14} className="text-gray-500 dark:text-gray-400" />
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
        >
          <option value="">Unassigned</option>
          {usersList.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between">
        <button
          onClick={handleRemoveAssignment}
          className="px-2 py-1 text-xs flex items-center text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
        >
          <Trash2 size={12} className="mr-1" />
          Remove
        </button>
        <button
          onClick={handleAssignTask}
          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save
        </button>
      </div>
    </div>
  )
}
