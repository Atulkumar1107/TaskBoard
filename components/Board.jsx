"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable } from "react-beautiful-dnd"
import Column from "./Column"
import AddColumn from "./AddColumn"
import { useBoard } from "@/context/BoardContext"
import { motion } from "framer-motion"

export default function Board() {
  const { columns, columnOrder, moveTask, moveColumn, setUserActivity } = useBoard()
  const [isDragging, setIsDragging] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = (result) => {
    setIsDragging(false)
    const { source, destination, type } = result

    // Dropped outside a droppable area
    if (!destination) return

    // Handle column reordering
    if (type === "column") {
      moveColumn(source.index, destination.index)
      return
    }

    // Handle task movement
    moveTask(source, destination)
  }

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Droppable 
        droppableId="board" 
        direction="horizontal" 
        type="column"
        isDropDisabled={false}
      >
        {(provided) => (
          <div
            className={`flex gap-4 overflow-x-auto pb-8 ${isMobile ? "snap-x snap-mandatory" : ""}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {columnOrder.map((columnId, index) => {
              const column = columns.find((col) => col.id === columnId)
              if (!column) return null

              return (
                <motion.div
                  key={column.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={isMobile ? "snap-center" : ""}
                >
                  <Column 
                    column={column} 
                    index={index}
                    isDragging={isDragging}
                  />
                </motion.div>
              )
            })}
            {provided.placeholder}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: columnOrder.length * 0.1 }}
              className={isMobile ? "snap-center" : ""}
            >
              <AddColumn />
            </motion.div>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}