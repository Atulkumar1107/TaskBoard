"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { useBoard } from "@/context/BoardContext"

export default function SearchTasks() {
  const { tasks } = useBoard()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      const results = Object.values(tasks).filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchTerm, tasks])

  const handleSearchClick = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    setSearchTerm("")
    setSearchResults([])
  }

  return (
    <div className="relative">
      {!isOpen ? (
        <button
          onClick={handleSearchClick}
          className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 shadow-sm"
          aria-label="Search tasks"
        >
          <Search size={18} />
        </button>
      ) : (
        <div className="absolute right-0 top-0 w-64 md:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-10 border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-gray-500 dark:text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks..."
              className="flex-1 bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 text-sm"
            />
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-3 max-h-60 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
              {searchResults.map((task) => (
                <div
                  key={task.id}
                  className="py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 px-2 rounded"
                  onClick={() => {
                    // Scroll to task (in a real app, this would be implemented)
                    alert(`Navigating to task: ${task.title}`)
                    handleClose()
                  }}
                >
                  <h4 className="text-sm font-medium text-gray-800 dark:text-white">{task.title}</h4>
                  {task.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-300 line-clamp-1 mt-1">{task.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {searchTerm.trim().length > 1 && searchResults.length === 0 && (
            <div className="mt-3 text-sm text-gray-500 dark:text-gray-300 text-center py-2">No tasks found</div>
          )}
        </div>
      )}
    </div>
  )
}
