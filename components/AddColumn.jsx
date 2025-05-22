"use client"

import { useState, useRef, useEffect } from "react"
import { useBoard } from "@/context/BoardContext"
import { Plus, X } from "lucide-react"
import toast from "react-hot-toast"

export default function AddColumn() {
  const { addColumn } = useBoard()
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState("")
  const inputRef = useRef(null)

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAdding])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim()) {
      addColumn(title)
      setTitle("")
      setIsAdding(false)
      toast.success("Column added")
    }
  }

  const handleCancel = () => {
    setTitle("")
    setIsAdding(false)
  }

  if (isAdding) {
    return (
      <div className="flex-shrink-0 w-72 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm p-3">
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter column title"
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded mb-2"
            onKeyDown={(e) => e.key === "Escape" && handleCancel()}
          />
          <div className="flex gap-2">
            <button type="submit" className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
              Add Column
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="flex-shrink-0 w-72 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
    >
      <Plus size={20} className="mr-2" />
      Add Column
    </button>
  )
}
