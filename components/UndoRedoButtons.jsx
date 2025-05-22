"use client"

import { useBoard } from "@/context/BoardContext"
import { Undo2, Redo2 } from "lucide-react"

export default function UndoRedoButtons() {
  const { undo, redo, canUndo, canRedo } = useBoard()

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={undo}
        disabled={!canUndo}
        className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Undo"
      >
        <Undo2 size={16} />
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Redo"
      >
        <Redo2 size={16} />
      </button>
    </div>
  )
}
