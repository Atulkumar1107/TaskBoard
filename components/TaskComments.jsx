"use client"

import { useState, useRef } from "react"
import { useBoard } from "@/context/BoardContext"
import { X, Send, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

export default function TaskComments({ task, onClose }) {
  const { users, currentUser } = useBoard()
  const [newComment, setNewComment] = useState("")
  const formRef = useRef(null)

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    // Get the form element to submit directly to the server
    const form = formRef.current
    if (!form) return

    // Create a hidden input for the task ID
    const taskIdInput = document.createElement("input")
    taskIdInput.type = "hidden"
    taskIdInput.name = "taskId"
    taskIdInput.value = task.id
    form.appendChild(taskIdInput)

    // Create a hidden input for the comment text
    const commentInput = document.createElement("input")
    commentInput.type = "hidden"
    commentInput.name = "comment"
    commentInput.value = newComment
    form.appendChild(commentInput)

    // Submit the form directly to the server
    const formData = new FormData(form)

    // Call the server action
    fetch("/api/comments", {
      method: "POST",
      body: JSON.stringify({
        taskId: task.id,
        text: newComment,
        author: currentUser.id,
      }),
    })

    // Clear the input field
    setNewComment("")

    // Show success message
    toast.success("Comment added", {
      position: "top-center",
    })

    // Remove the hidden inputs
    form.removeChild(taskIdInput)
    form.removeChild(commentInput)
  }

  const handleDeleteComment = (commentId) => {
    fetch("/api/comments", {
      method: "DELETE",
      body: JSON.stringify({
        taskId: task.id,
        commentId,
      }),
    })

    toast.success("Comment deleted", {
      position: "top-center",
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Comments</h4>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <X size={14} />
        </button>
      </div>

      <div className="max-h-40 overflow-y-auto mb-3">
        {task.comments && task.comments.length > 0 ? (
          <div className="space-y-3">
            {task.comments.map((comment) => {
              const author = users[comment.author] || { name: comment.author }
              const isCurrentUser = comment.author === currentUser.id

              return (
                <div key={comment.id} className="text-sm">
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-gray-700 dark:text-gray-300">{author.name}</div>
                    {isCurrentUser && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 break-words">{comment.text}</p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDate(comment.createdAt)}</div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-300">No comments yet</p>
        )}
      </div>

      <form ref={formRef} onSubmit={handleAddComment} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="p-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  )
}
