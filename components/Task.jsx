"use client"

import { useState, useRef, useEffect } from "react"
import { Draggable } from "react-beautiful-dnd"
import { useBoard } from "@/context/BoardContext"
import { Pencil, Trash2, MoreVertical, Calendar, User, MessageSquare, Clock, AlertTriangle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import TaskComments from "./TaskComments"
import TaskDueDate from "./TaskDueDate"
import TaskAssignment from "./TaskAssignment"
import toast from "react-hot-toast"

export default function Task({ task, index }) {
  const { updateTask, deleteTask, setUserActivity, activeUsers, users } = useBoard()
  const [isEditing, setIsEditing] = useState(false)
  const [isShowingComments, setIsShowingComments] = useState(false)
  const [isShowingDueDate, setIsShowingDueDate] = useState(false)
  const [isShowingAssignment, setIsShowingAssignment] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || "")
  const [isHovered, setIsHovered] = useState(false)
  const titleRef = useRef(null)

  // Find users who are currently editing this task
  const activeEditors = Object.entries(activeUsers)
    .filter(([_, data]) => data.action === "editing-task" && data.itemId === task.id)
    .map(([userId]) => userId)

  useEffect(() => {
    if (isEditing && titleRef.current) {
      titleRef.current.focus()
      setUserActivity("editing-task", task.id)
    }
  }, [isEditing, task.id, setUserActivity])

  const handleSave = () => {
    if (title.trim()) {
      updateTask(task.id, title, description, task.dueDate, task.assignedTo)
      setIsEditing(false)
      setUserActivity("viewing", null)
      toast.success("Task updated successfully", {
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
    setTitle(task.title)
    setDescription(task.description || "")
    setIsEditing(false)
    setUserActivity("viewing", null)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  const handleDelete = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p>Are you sure you want to delete "{task.title}"?</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteTask(task.id)
                toast.dismiss(t.id)
                toast.success("Task deleted", {
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

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getDueDateStatus = () => {
    if (!task.dueDate) return null

    const now = new Date()
    const dueDate = new Date(task.dueDate)
    const diffTime = dueDate - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffTime < 0) return "overdue"
    if (diffDays <= 1) return "due-soon"
    return "on-track"
  }

  const dueDateStatus = getDueDateStatus()
  const assignedUser = task.assignedTo && users ? users[task.assignedTo] : null
  const hasComments = task.comments && task.comments.length > 0
  const latestComment = hasComments ? task.comments[task.comments.length - 1] : null

  const getAssignedUserName = () => {
    if (!task.assignedTo) return null

    // Hardcoded mapping for user names
    const userMap = {
      "user-john": "John Smith",
      "user-sarah": "Sarah Johnson",
      "user-michael": "Michael Brown",
      "user-emily": "Emily Davis",
      "user-david": "David Wilson",
      "user-jessica": "Jessica Lee",
      "user-robert": "Robert Taylor",
      "user-amanda": "Amanda Clark",
    }

    return userMap[task.assignedTo] || task.assignedTo
  }

  const getPriorityBorderColor = () => {
    if (dueDateStatus === "overdue") return "border-l-4 border-l-red-500"
    if (dueDateStatus === "due-soon") return "border-l-4 border-l-yellow-500"
    if (task.assignedTo) return "border-l-4 border-l-blue-500"
    return ""
  }

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-2 p-3 bg-white dark:bg-gray-850 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 ${
            snapshot.isDragging ? "shadow-lg ring-2 ring-purple-500 ring-opacity-50" : ""
          } ${getPriorityBorderColor()} transition-all duration-200 transform ${
            snapshot.isDragging ? "rotate-1 scale-105" : ""
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isEditing ? (
            <div className="space-y-2">
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow duration-200"
                placeholder="Task title"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && handleCancel()}
                className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded min-h-[60px] focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow duration-200"
                placeholder="Add a description (optional)"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={handleCancel}
                  className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-2 py-1 text-xs bg-purple-600 text-white hover:bg-purple-700 rounded transition-colors duration-200"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-gray-800 dark:text-white break-words group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
                  {task.title}
                  {activeEditors.length > 0 && (
                    <span
                      className="inline-block w-2 h-2 bg-yellow-500 rounded-full ml-2 animate-pulse"
                      title="Someone is editing this task"
                    ></span>
                  )}
                </h4>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0 md:opacity-100"}`}
                    >
                      <MoreVertical size={14} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="animate-in fade-in slide-in-from-top-5 duration-200">
                    <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer">
                      <Pencil size={14} className="mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsShowingDueDate(true)} className="cursor-pointer">
                      <Calendar size={14} className="mr-2" />
                      Set due date
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsShowingAssignment(true)} className="cursor-pointer">
                      <User size={14} className="mr-2" />
                      Assign task
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsShowingComments(true)} className="cursor-pointer">
                      <MessageSquare size={14} className="mr-2" />
                      Comments
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-red-600 dark:text-red-400">
                      <Trash2 size={14} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 break-words">{task.description}</p>

              {/* Comments preview section - only showing the comment text */}
              {latestComment && (
                <div
                  className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors duration-200"
                  onClick={() => setIsShowingComments(true)}
                >
                  <p className="text-sm text-gray-600 dark:text-gray-300 break-words line-clamp-2 italic">
                    "{latestComment.text}"
                  </p>
                  {task.comments.length > 1 && (
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 hover:underline">
                      View all {task.comments.length} comments
                    </div>
                  )}
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {dueDateStatus && (
                  <div
                    className={`flex items-center text-xs px-2 py-1 rounded ${
                      dueDateStatus === "overdue"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        : dueDateStatus === "due-soon"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    } transition-colors duration-200`}
                  >
                    {dueDateStatus === "overdue" ? (
                      <AlertTriangle size={12} className="mr-1" />
                    ) : (
                      <Clock size={12} className="mr-1" />
                    )}
                    {dueDateStatus === "overdue"
                      ? "Overdue"
                      : dueDateStatus === "due-soon"
                        ? "Due soon"
                        : "Due " + formatDate(task.dueDate)}
                  </div>
                )}

                {task.assignedTo && (
                  <div className="flex items-center text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded transition-colors duration-200">
                    <User size={12} className="mr-1" />
                    {getAssignedUserName()}
                  </div>
                )}

                {hasComments && (
                  <div
                    className="flex items-center text-xs bg-purple-100 text-purple-800 dark:bg-purple-200 dark:text-purple-300 px-2 py-1 rounded cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors duration-200"
                    onClick={() => setIsShowingComments(true)}
                  >
                    <MessageSquare size={12} className="mr-1" />
                    {task.comments.length}
                  </div>
                )}
              </div>

              <div className="mt-2 text-xs text-gray-500 dark:text-gray-300">Updated {formatDate(task.updatedAt)}</div>
            </div>
          )}

          {isShowingComments && <TaskComments task={task} onClose={() => setIsShowingComments(false)} />}

          {isShowingDueDate && <TaskDueDate task={task} onClose={() => setIsShowingDueDate(false)} />}

          {isShowingAssignment && <TaskAssignment task={task} onClose={() => setIsShowingAssignment(false)} />}
        </div>
      )}
    </Draggable>
  )
}
