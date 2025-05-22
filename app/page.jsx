"use client"
import Board from "@/components/Board"
import UserPresence from "@/components/UserPresence"
import { BoardProvider } from "@/context/BoardContext"
import UndoRedoButtons from "@/components/UndoRedoButtons"
import ThemeToggle from "@/components/ThemeToggle"
import TaskFilter from "@/components/TaskFilter"
import SearchTasks from "@/components/SearchTasks"

export default function Home() {
  return (
    <BoardProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6 transition-colors duration-300">
        <header className="mb-6">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Collaborative Task Board</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <UndoRedoButtons />
                <ThemeToggle />
                <TaskFilter />
                <SearchTasks />
              </div>
              <UserPresence />
            </div>
          </div>
        </header>
        <main className="container mx-auto">
          <Board />
        </main>
      </div>
    </BoardProvider>
  )
}
