"use client"

import { useState } from "react"
import { Filter, X, Check, Calendar, User } from "lucide-react"
import { useBoard } from "@/context/BoardContext"

export default function TaskFilter() {
  const { tasks } = useBoard()
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    showOverdue: false,
    showAssigned: false,
    showUnassigned: false,
  })

  const toggleFilter = (filterName) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }))
  }

  const clearFilters = () => {
    setFilters({
      showOverdue: false,
      showAssigned: false,
      showUnassigned: false,
    })
  }

  const getFilterCount = () => {
    return Object.values(filters).filter(Boolean).length
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 shadow-sm flex items-center"
        aria-label="Filter tasks"
      >
        <Filter size={18} />
        {getFilterCount() > 0 && (
          <span className="ml-1 text-xs font-medium bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
            {getFilterCount()}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-10 border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter Tasks</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-red-500 dark:text-red-400" />
                <span className="text-sm text-gray-700 dark:text-gray-200">Overdue</span>
              </div>
              <button
                onClick={() => toggleFilter("showOverdue")}
                className={`w-5 h-5 rounded ${
                  filters.showOverdue ? "bg-purple-500 text-white" : "bg-gray-200 dark:bg-gray-700"
                } flex items-center justify-center`}
              >
                {filters.showOverdue && <Check size={12} />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={16} className="text-blue-500 dark:text-blue-400" />
                <span className="text-sm text-gray-700 dark:text-gray-200">Assigned</span>
              </div>
              <button
                onClick={() => toggleFilter("showAssigned")}
                className={`w-5 h-5 rounded ${
                  filters.showAssigned ? "bg-purple-500 text-white" : "bg-gray-200 dark:bg-gray-700"
                } flex items-center justify-center`}
              >
                {filters.showAssigned && <Check size={12} />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-200">Unassigned</span>
              </div>
              <button
                onClick={() => toggleFilter("showUnassigned")}
                className={`w-5 h-5 rounded ${
                  filters.showUnassigned ? "bg-purple-500 text-white" : "bg-gray-200 dark:bg-gray-700"
                } flex items-center justify-center`}
              >
                {filters.showUnassigned && <Check size={12} />}
              </button>
            </div>
          </div>

          {getFilterCount() > 0 && (
            <button
              onClick={clearFilters}
              className="mt-3 w-full text-xs text-purple-600 dark:text-purple-300 hover:text-purple-700 dark:hover:text-purple-200"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
