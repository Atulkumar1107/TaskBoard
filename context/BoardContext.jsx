"use client"

import { createContext, useContext, useEffect, useReducer } from "react"
import { v4 as uuidv4 } from "uuid"
import { socket, connectSocket, userId, userName } from "@/lib/socket"

const BoardContext = createContext()

const initialState = {
  columns: [],
  tasks: {},
  columnOrder: [],
  onlineUsers: 0,
  activeUsers: {},
  users: {},
  currentUser: { id: userId, name: userName },
  canUndo: false,
  canRedo: false,
}

function boardReducer(state, action) {
  switch (action.type) {
    case "SET_INITIAL_DATA":
      return {
        ...state,
        columns: action.payload.columns || [],
        tasks: action.payload.tasks || {},
        columnOrder: action.payload.columnOrder || [],
        users: action.payload.users || {},
        canUndo: action.payload.history && action.payload.currentHistoryIndex > -1,
        canRedo: action.payload.history && action.payload.currentHistoryIndex < action.payload.history.length - 1,
      }

    case "ADD_COLUMN":
      const newColumn = {
        id: action.payload.id || uuidv4(),
        title: action.payload.title,
        taskIds: [],
      }

      return {
        ...state,
        columns: [...state.columns, newColumn],
        columnOrder: [...state.columnOrder, newColumn.id],
      }

    case "UPDATE_COLUMN":
      return {
        ...state,
        columns: state.columns.map((column) =>
          column.id === action.payload.id ? { ...column, title: action.payload.title } : column,
        ),
      }

    case "DELETE_COLUMN":
      const columnToDelete = state.columns.find((col) => col.id === action.payload.id)
      if (!columnToDelete) return state

      // Remove tasks that belong to this column
      const updatedTasks = { ...state.tasks }
      columnToDelete.taskIds.forEach((taskId) => {
        delete updatedTasks[taskId]
      })

      return {
        ...state,
        columns: state.columns.filter((column) => column.id !== action.payload.id),
        columnOrder: state.columnOrder.filter((id) => id !== action.payload.id),
        tasks: updatedTasks,
      }

    case "ADD_TASK":
      const newTask = {
        id: action.payload.id || uuidv4(),
        title: action.payload.title,
        description: action.payload.description || "",
        createdAt: action.payload.createdAt || new Date().toISOString(),
        updatedAt: action.payload.updatedAt || new Date().toISOString(),
        comments: action.payload.comments || [],
        dueDate: action.payload.dueDate || null,
        assignedTo: action.payload.assignedTo || null,
      }

      const columnToAddTask = state.columns.find((col) => col.id === action.payload.columnId)
      if (!columnToAddTask) return state

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [newTask.id]: newTask,
        },
        columns: state.columns.map((column) =>
          column.id === action.payload.columnId ? { ...column, taskIds: [...column.taskIds, newTask.id] } : column,
        ),
      }

    case "UPDATE_TASK":
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.payload.id]: {
            ...state.tasks[action.payload.id],
            title: action.payload.title,
            description: action.payload.description,
            updatedAt: new Date().toISOString(),
            dueDate:
              action.payload.dueDate !== undefined ? action.payload.dueDate : state.tasks[action.payload.id].dueDate,
            assignedTo:
              action.payload.assignedTo !== undefined
                ? action.payload.assignedTo
                : state.tasks[action.payload.id].assignedTo,
          },
        },
      }

    case "DELETE_TASK":
      const { [action.payload.id]: taskToDelete, ...remainingTasks } = state.tasks

      return {
        ...state,
        tasks: remainingTasks,
        columns: state.columns.map((column) => ({
          ...column,
          taskIds: column.taskIds.filter((id) => id !== action.payload.id),
        })),
      }

    case "MOVE_TASK":
      const { source, destination } = action.payload

      // If dropped outside a droppable area
      if (!destination) return state

      // If dropped in the same position
      if (source.droppableId === destination.droppableId && source.index === destination.index) {
        return state
      }

      // Find source and destination columns
      const sourceColumn = state.columns.find((col) => col.id === source.droppableId)
      const destColumn = state.columns.find((col) => col.id === destination.droppableId)

      if (!sourceColumn || !destColumn) return state

      // Create new arrays to avoid mutating state
      const sourceTaskIds = [...sourceColumn.taskIds]
      const destTaskIds = source.droppableId === destination.droppableId ? sourceTaskIds : [...destColumn.taskIds]

      // Remove task from source
      const [movedTaskId] = sourceTaskIds.splice(source.index, 1)

      // Insert task into destination
      destTaskIds.splice(destination.index, 0, movedTaskId)

      return {
        ...state,
        columns: state.columns.map((column) => {
          if (column.id === source.droppableId) {
            return { ...column, taskIds: sourceTaskIds }
          }
          if (column.id === destination.droppableId) {
            return { ...column, taskIds: destTaskIds }
          }
          return column
        }),
      }

    case "MOVE_COLUMN":
      const { sourceIndex, destinationIndex } = action.payload

      // If dropped in the same position
      if (sourceIndex === destinationIndex) return state

      const newColumnOrder = [...state.columnOrder]
      const [movedColumnId] = newColumnOrder.splice(sourceIndex, 1)
      newColumnOrder.splice(destinationIndex, 0, movedColumnId)

      return {
        ...state,
        columnOrder: newColumnOrder,
      }

    case "SET_ONLINE_USERS":
      return {
        ...state,
        onlineUsers: action.payload,
      }

    case "SET_ACTIVE_USER":
      return {
        ...state,
        activeUsers: {
          ...state.activeUsers,
          [action.payload.userId]: {
            action: action.payload.action,
            itemId: action.payload.itemId,
            timestamp: Date.now(),
          },
        },
      }

    case "REMOVE_ACTIVE_USER":
      const { [action.payload]: _, ...remainingActiveUsers } = state.activeUsers
      return {
        ...state,
        activeUsers: remainingActiveUsers,
      }

    case "ADD_COMMENT":
      const { taskId, comment } = action.payload
      if (!state.tasks[taskId]) return state

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [taskId]: {
            ...state.tasks[taskId],
            comments: [...(state.tasks[taskId].comments || []), comment],
          },
        },
      }

    case "DELETE_COMMENT":
      const { taskId: commentTaskId, commentId } = action.payload
      if (!state.tasks[commentTaskId] || !state.tasks[commentTaskId].comments) return state

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [commentTaskId]: {
            ...state.tasks[commentTaskId],
            comments: state.tasks[commentTaskId].comments.filter((c) => c.id !== commentId),
          },
        },
      }

    case "UPDATE_DUE_DATE":
      const { taskId: dueDateTaskId, dueDate } = action.payload
      if (!state.tasks[dueDateTaskId]) return state

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [dueDateTaskId]: {
            ...state.tasks[dueDateTaskId],
            dueDate,
          },
        },
      }

    case "ASSIGN_TASK":
      const { taskId: assignTaskId, userId: assignUserId } = action.payload
      if (!state.tasks[assignTaskId]) return state

      return {
        ...state,
        tasks: {
          ...state.tasks,
          [assignTaskId]: {
            ...state.tasks[assignTaskId],
            assignedTo: assignUserId,
          },
        },
      }

    case "SET_HISTORY_STATE":
      return {
        ...state,
        canUndo: action.payload.canUndo,
        canRedo: action.payload.canRedo,
      }

    default:
      return state
  }
}

export function BoardProvider({ children }) {
  const [state, dispatch] = useReducer(boardReducer, initialState)

  useEffect(() => {
    // Connect to Socket.IO server
    connectSocket()

    // Get initial data
    socket.on("initialData", (data) => {
      dispatch({ type: "SET_INITIAL_DATA", payload: data })
    })

    // Listen for board updates
    socket.on("columnAdded", (column) => {
      dispatch({ type: "ADD_COLUMN", payload: column })
    })

    socket.on("columnUpdated", (column) => {
      dispatch({ type: "UPDATE_COLUMN", payload: column })
    })

    socket.on("columnDeleted", (columnId) => {
      dispatch({ type: "DELETE_COLUMN", payload: { id: columnId } })
    })

    socket.on("taskAdded", (task) => {
      dispatch({ type: "ADD_TASK", payload: task })
    })

    socket.on("taskUpdated", (task) => {
      dispatch({ type: "UPDATE_TASK", payload: task })
    })

    socket.on("taskDeleted", (taskId) => {
      dispatch({ type: "DELETE_TASK", payload: { id: taskId } })
    })

    socket.on("taskMoved", (moveData) => {
      dispatch({ type: "MOVE_TASK", payload: moveData })
    })

    socket.on("columnMoved", (moveData) => {
      dispatch({ type: "MOVE_COLUMN", payload: moveData })
    })

    socket.on("onlineUsers", (count) => {
      dispatch({ type: "SET_ONLINE_USERS", payload: count })
    })

    socket.on("userActive", (userData) => {
      dispatch({ type: "SET_ACTIVE_USER", payload: userData })
    })

    socket.on("userInactive", (userId) => {
      dispatch({ type: "REMOVE_ACTIVE_USER", payload: userId })
    })

    socket.on("commentAdded", ({ taskId, comment }) => {
      dispatch({ type: "ADD_COMMENT", payload: { taskId, comment } })
    })

    socket.on("commentDeleted", ({ taskId, commentId }) => {
      dispatch({ type: "DELETE_COMMENT", payload: { taskId, commentId } })
    })

    socket.on("dueDateUpdated", ({ taskId, dueDate }) => {
      dispatch({ type: "UPDATE_DUE_DATE", payload: { taskId, dueDate } })
    })

    socket.on("taskAssigned", ({ taskId, userId }) => {
      dispatch({ type: "ASSIGN_TASK", payload: { taskId, userId } })
    })

    socket.on("historyChanged", ({ canUndo, canRedo }) => {
      dispatch({ type: "SET_HISTORY_STATE", payload: { canUndo, canRedo } })
    })

    // Request initial data
    try {
      socket.emit("getInitialData")
    } catch (error) {
      console.error("Error requesting initial data:", error)
    }

    // Clean up on unmount
    return () => {
      try {
        socket.off("initialData")
        socket.off("columnAdded")
        socket.off("columnUpdated")
        socket.off("columnDeleted")
        socket.off("taskAdded")
        socket.off("taskUpdated")
        socket.off("taskDeleted")
        socket.off("taskMoved")
        socket.off("columnMoved")
        socket.off("onlineUsers")
        socket.off("userActive")
        socket.off("userInactive")
        socket.off("commentAdded")
        socket.off("commentDeleted")
        socket.off("dueDateUpdated")
        socket.off("taskAssigned")
        socket.off("historyChanged")
        socket.disconnect()
      } catch (error) {
        console.error("Error during cleanup:", error)
      }
    }
  }, [])

  // Actions
  const addColumn = (title) => {
    const newColumn = {
      id: uuidv4(),
      title,
      taskIds: [],
    }

    dispatch({ type: "ADD_COLUMN", payload: newColumn })
    socket.emit("addColumn", newColumn)
  }

  const updateColumn = (id, title) => {
    dispatch({ type: "UPDATE_COLUMN", payload: { id, title } })
    socket.emit("updateColumn", { id, title })
  }

  const deleteColumn = (id) => {
    dispatch({ type: "DELETE_COLUMN", payload: { id } })
    socket.emit("deleteColumn", id)
  }

  const addTask = (columnId, title, description = "", dueDate = null, assignedTo = null) => {
    const newTask = {
      id: uuidv4(),
      title,
      description,
      columnId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      dueDate,
      assignedTo,
    }

    dispatch({ type: "ADD_TASK", payload: newTask })
    socket.emit("addTask", newTask)
  }

  const updateTask = (id, title, description, dueDate, assignedTo) => {
    const updatedTask = { id, title, description, dueDate, assignedTo }
    dispatch({ type: "UPDATE_TASK", payload: updatedTask })
    socket.emit("updateTask", updatedTask)
  }

  const deleteTask = (id) => {
    dispatch({ type: "DELETE_TASK", payload: { id } })
    socket.emit("deleteTask", id)
  }

  const moveTask = (source, destination) => {
    dispatch({
      type: "MOVE_TASK",
      payload: { source, destination },
    })
    socket.emit("moveTask", { source, destination })
  }

  const moveColumn = (sourceIndex, destinationIndex) => {
    dispatch({
      type: "MOVE_COLUMN",
      payload: { sourceIndex, destinationIndex },
    })
    socket.emit("moveColumn", { sourceIndex, destinationIndex })
  }

  const addComment = (taskId, text) => {
    const comment = {
      id: uuidv4(),
      text,
      author: state.currentUser.id,
      createdAt: new Date().toISOString(),
    }

    // Update local state immediately
    dispatch({ type: "ADD_COMMENT", payload: { taskId, comment } })

    // Also send to server for other clients
    socket.emit("addComment", { taskId, comment })
  }

  const deleteComment = (taskId, commentId) => {
    dispatch({ type: "DELETE_COMMENT", payload: { taskId, commentId } })
    socket.emit("deleteComment", { taskId, commentId })
  }

  const updateDueDate = (taskId, dueDate) => {
    dispatch({ type: "UPDATE_DUE_DATE", payload: { taskId, dueDate } })
    socket.emit("updateDueDate", { taskId, dueDate })
  }

  const assignTask = (taskId, userId) => {
    dispatch({ type: "ASSIGN_TASK", payload: { taskId, userId } })
    socket.emit("assignTask", { taskId, userId })
  }

  const undo = () => {
    if (state.canUndo) {
      socket.emit("undo")
    }
  }

  const redo = () => {
    if (state.canRedo) {
      socket.emit("redo")
    }
  }

  const setUserActivity = (action, itemId) => {
    socket.emit("setActivity", { action, itemId })
  }

  return (
    <BoardContext.Provider
      value={{
        ...state,
        addColumn,
        updateColumn,
        deleteColumn,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        moveColumn,
        addComment,
        deleteComment,
        updateDueDate,
        assignTask,
        undo,
        redo,
        setUserActivity,
      }}
    >
      {children}
    </BoardContext.Provider>
  )
}

export function useBoard() {
  const context = useContext(BoardContext)
  if (!context) {
    throw new Error("useBoard must be used within a BoardProvider")
  }
  return context
}
