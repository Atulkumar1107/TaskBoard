"use client"

import { useState, useRef, useEffect } from "react"
import { Draggable, Droppable } from "react-beautiful-dnd"
import Task from "./Task"
import AddTask from "./AddTask"
import { useBoard } from "@/context/BoardContext"
import { Pencil, Trash2, MoreVertical, X, Check, GripVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import toast from "react-hot-toast"
import { motion } from "framer-motion"

export default function Column({ column, index }) {
  const { updateColumn, deleteColumn, tasks, setUserActivity, activeUsers } = useBoard()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(column.title)
  const [isHovered, setIsHovered] = useState(false)
  const inputRef = useRef(null)

  // Find users who are currently editing this column
  const activeEditors = Object.entries(activeUsers)
    .filter(([_, data]) => data.action === "editing-column" && data.itemId === column.id)
    .map(([userId]) => userId)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      setUserActivity("editing-column", column.id)
    }
  }, [isEditing, column.id, setUserActivity])

  const handleSave = () => {
    if (title.trim()) {
      updateColumn(column.id, title)
      setIsEditing(false)
      setUserActivity("viewing", null)
      toast.success("Column updated", {
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
    setTitle(column.title)
    setIsEditing(false)
    setUserActivity("viewing", null)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  const handleDelete = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p>Are you sure you want to delete the column "{column.title}"?</p>
          <p className="text-sm text-red-500">This will also delete all tasks in this column.</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteColumn(column.id)
                toast.dismiss(t.id)
                toast.success("Column deleted", {
                  position: "top-center",
                  icon: "🗑️",
                  style: {
                    borderRadius: "10px",
                    background: "#333",
                    color: "#fff",
                  },
                })
              }}
              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: "top-center",
        style: {
          borderRadius: "10px",
          background: "#fff",
          color: "#333",
          boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
          padding: "16px",
        },
      },
    )
  }

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided, snapshot) => (
        <div
          className={`flex-shrink-0 w-72 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm flex flex-col max-h-[calc(100vh-12rem)] ${
            snapshot.isDragging ? "ring-2 ring-purple-500 shadow-lg" : ""
          } transition-all duration-200`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className="p-3 flex items-center justify-between bg-gray-200 dark:bg-gray-700 rounded-t-lg"
            {...provided.dragHandleProps}
          >
            {isEditing ? (
              <div className="flex items-center w-full gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow duration-200"
                />
                <button
                  onClick={handleSave}
                  className="p-1 text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 transition-colors duration-200"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <GripVertical
                    size={16}
                    className={`text-gray-500 dark:text-gray-400 ${isHovered ? "opacity-100" : "opacity-0 md:opacity-100"} transition-opacity duration-200`}
                  />
                  <h3 className="font-medium text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    {column.title}
                    {activeEditors.length > 0 && (
                      <span
                        className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse"
                        title="Someone is editing this column"
                      ></span>
                    )}
                  </h3>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-300 mr-2 bg-gray-300 dark:bg-gray-600 px-2 py-0.5 rounded-full">
                    {column.taskIds.length}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200">
                        <MoreVertical size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="animate-in fade-in slide-in-from-top-5 duration-200">
                      <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer">
                        <Pencil size={14} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDelete}
                        className="cursor-pointer text-red-600 dark:text-red-400"
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>

          <Droppable droppableId={column.id} type="task">
            {(provided, snapshot) => (
              <div
                className={`flex-1 p-2 overflow-y-auto ${
                  snapshot.isDraggingOver ? "bg-purple-100 dark:bg-purple-900/20" : ""
                } transition-colors duration-200`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {column.taskIds.map((taskId, index) => {
                  const task = tasks[taskId]
                  if (!task) return null
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Task task={task} index={index} />
                    </motion.div>
                  )
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <AddTask columnId={column.id} />
          </div>
        </div>
      )}
    </Draggable>
  )
}
