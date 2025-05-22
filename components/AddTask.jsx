"use client"

import { useState, useRef, useEffect } from "react"
import { useBoard } from "@/context/BoardContext"
import { Plus, X, Calendar, User, ArrowDown } from "lucide-react"
import toast from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

export default function AddTask({ columnId }) {
  const { addTask, users } = useBoard()
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [assignedTo, setAssignedTo] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [usersList, setUsersList] = useState([])
  const inputRef = useRef(null)

  // Extract users from the users object when it's available
  useEffect(() => {
    if (users) {
      const usersArray = Object.values(users)
      console.log("Users for add task:", usersArray)
      setUsersList(usersArray)
    }
  }, [users])

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAdding])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim()) {
      const dueDateValue = dueDate ? new Date(dueDate + "T12:00:00").toISOString() : null
      addTask(columnId, title, description, dueDateValue, assignedTo || null)
      setTitle("")
      setDescription("")
      setDueDate("")
      setAssignedTo("")
      setShowAdvanced(false)
      setIsAdding(false)
      toast.success("Task added", {
        position: "top-center",
        icon: "✅",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      })
    }
  }

  const handleCancel = () => {
    setTitle("")
    setDescription("")
    setDueDate("")
    setAssignedTo("")
    setShowAdvanced(false)
    setIsAdding(false)
  }

  if (isAdding) {
    return (
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
      >
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow duration-200"
          onKeyDown={(e) => e.key === "Escape" && handleCancel()}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description (optional)"
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded min-h-[60px] focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow duration-200"
          onKeyDown={(e) => e.key === "Escape" && handleCancel()}
        />

        <AnimatePresence>
          {!showAdvanced ? (
            <motion.button
              type="button"
              onClick={() => setShowAdvanced(true)}
              className="text-xs text-purple-600 dark:text-purple-300 hover:text-purple-700 dark:hover:text-purple-200 flex items-center gap-1"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ArrowDown size={12} />
              Show advanced options
            </motion.button>
          ) : (
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-500 dark:text-gray-400" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow duration-200"
                  placeholder="Due date"
                />
              </div>

              <div className="flex items-center gap-2">
                <User size={14} className="text-gray-500 dark:text-gray-400" />
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow duration-200"
                >
                  <option value="">Unassigned</option>
                  <option value="user-john">John Smith</option>
                  <option value="user-sarah">Sarah Johnson</option>
                  <option value="user-michael">Michael Brown</option>
                  <option value="user-emily">Emily Davis</option>
                  <option value="user-david">David Wilson</option>
                  <option value="user-jessica">Jessica Lee</option>
                  <option value="user-robert">Robert Taylor</option>
                  <option value="user-amanda">Amanda Clark</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors duration-200 shadow-sm"
          >
            Add Task
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>
      </motion.form>
    )
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="w-full py-1 px-2 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200 hover:shadow-sm"
    >
      <Plus size={16} className="mr-1" />
      Add Task
    </button>
  )
}
