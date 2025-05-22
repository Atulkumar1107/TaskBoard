"use client"

import { useState } from "react"
import { useBoard } from "@/context/BoardContext"
import { X, Calendar, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

export default function TaskDueDate({ task, onClose }) {
  const { updateDueDate } = useBoard()
  const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "")

  const handleUpdateDueDate = () => {
    const newDueDate = dueDate ? new Date(dueDate + "T12:00:00").toISOString() : null
    updateDueDate(task.id, newDueDate)
    onClose()
    toast.success(dueDate ? "Due date updated" : "Due date removed")
  }

  const handleRemoveDueDate = () => {
    updateDueDate(task.id, null)
    onClose()
    toast.success("Due date removed")
  }

  return (
    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Set Due Date</h4>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Calendar size={14} className="text-gray-500 dark:text-gray-400" />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={handleRemoveDueDate}
          className="px-2 py-1 text-xs flex items-center text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
        >
          <Trash2 size={12} className="mr-1" />
          Remove
        </button>
        <button
          onClick={handleUpdateDueDate}
          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save
        </button>
      </div>
    </div>
  )
}
