"use client"
import { v4 as uuidv4 } from "uuid"

// Generate a unique ID for this user
const userId = uuidv4()
const userName = `User-${userId.substring(0, 4)}`

// Create a socket instance
let socket

// Define fixed user IDs for consistency
const USERS = {
  JOHN: "user-john",
  SARAH: "user-sarah",
  MICHAEL: "user-michael",
  EMILY: "user-emily",
  DAVID: "user-david",
  JESSICA: "user-jessica",
  ROBERT: "user-robert",
  AMANDA: "user-amanda",
}

// Mock data for preview/development
const mockData = {
  columns: [
    { id: "column-1", title: "To Do", taskIds: ["task-1", "task-2", "task-3"] },
    { id: "column-2", title: "In Progress", taskIds: ["task-4", "task-5"] },
    { id: "column-3", title: "Done", taskIds: ["task-6"] },
  ],
  tasks: {
    "task-1": {
      id: "task-1",
      title: "Create project structure",
      description: "Set up the initial project files and dependencies",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [
        {
          id: "comment-1",
          text: "Let's use Next.js for this project",
          author: USERS.JOHN,
          createdAt: new Date().toISOString(),
        },
      ],
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
      assignedTo: null,
    },
    "task-2": {
      id: "task-2",
      title: "Implement drag and drop",
      description: "Add the ability to drag tasks between columns",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
      assignedTo: USERS.SARAH,
    },
    "task-3": {
      id: "task-3",
      title: "Add real-time updates",
      description: "Implement Socket.IO for real-time collaboration",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
      assignedTo: null,
    },
    "task-4": {
      id: "task-4",
      title: "Style the UI",
      description: "Add responsive styling with Tailwind CSS",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      dueDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago (overdue)
      assignedTo: USERS.MICHAEL,
    },
    "task-5": {
      id: "task-5",
      title: "Add user presence",
      description: "Show which users are online and what they're editing",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [
        {
          id: "comment-2",
          text: "I'll work on this feature",
          author: USERS.EMILY,
          createdAt: new Date().toISOString(),
        },
        {
          id: "comment-3",
          text: "Great, let me know if you need help",
          author: USERS.SARAH,
          createdAt: new Date().toISOString(),
        },
      ],
      dueDate: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
      assignedTo: null,
    },
    "task-6": {
      id: "task-6",
      title: "Write documentation",
      description: "Create a README with setup instructions",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [
        {
          id: "comment-4",
          text: "Documentation is ready for review",
          author: USERS.EMILY,
          createdAt: new Date().toISOString(),
        },
      ],
      dueDate: null,
      assignedTo: USERS.EMILY,
    },
  },
  columnOrder: ["column-1", "column-2", "column-3"],
  users: {
    [USERS.JOHN]: {
      id: USERS.JOHN,
      name: "John Smith",
      avatar: "https://ui-avatars.com/api/?name=John+Smith&background=random",
    },
    [USERS.SARAH]: {
      id: USERS.SARAH,
      name: "Sarah Johnson",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=random",
    },
    [USERS.MICHAEL]: {
      id: USERS.MICHAEL,
      name: "Michael Brown",
      avatar: "https://ui-avatars.com/api/?name=Michael+Brown&background=random",
    },
    [USERS.EMILY]: {
      id: USERS.EMILY,
      name: "Emily Davis",
      avatar: "https://ui-avatars.com/api/?name=Emily+Davis&background=random",
    },
    [USERS.DAVID]: {
      id: USERS.DAVID,
      name: "David Wilson",
      avatar: "https://ui-avatars.com/api/?name=David+Wilson&background=random",
    },
    [USERS.JESSICA]: {
      id: USERS.JESSICA,
      name: "Jessica Lee",
      avatar: "https://ui-avatars.com/api/?name=Jessica+Lee&background=random",
    },
    [USERS.ROBERT]: {
      id: USERS.ROBERT,
      name: "Robert Taylor",
      avatar: "https://ui-avatars.com/api/?name=Robert+Taylor&background=random",
    },
    [USERS.AMANDA]: {
      id: USERS.AMANDA,
      name: "Amanda Clark",
      avatar: "https://ui-avatars.com/api/?name=Amanda+Clark&background=random",
    },
  },
  history: [],
  currentHistoryIndex: -1,
}

// Add current user to users
mockData.users[userId] = {
  id: userId,
  name: userName,
  avatar: `https://ui-avatars.com/api/?name=${userName}&background=random`,
}

// Mock event listeners and emitters
class MockSocket {
  constructor() {
    this.listeners = {}
    this.onlineUsers = 1 // Start with 1 (self)
    this.activeUsers = {}
    this.pendingComments = new Set() // Track comments being processed

    // Simulate another user joining after 3 seconds
    setTimeout(() => {
      this.onlineUsers++
      this.emit("onlineUsers", this.onlineUsers)
    }, 3000)
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)

    // Auto-respond to getInitialData
    if (event === "getInitialData") {
      setTimeout(() => {
        this.emit("initialData", mockData)
      }, 100)
    }

    return this
  }

  off(event) {
    delete this.listeners[event]
    return this
  }

  emit(event, ...args) {
    // Handle special cases for mock functionality
    if (event === "addColumn") {
      const column = args[0]
      mockData.columns.push(column)
      mockData.columnOrder.push(column.id)

      // Add to history
      this.addToHistory({
        type: "ADD_COLUMN",
        payload: column,
      })

      // Simulate broadcast after a delay
      setTimeout(() => {
        this.broadcast("columnAdded", column)
      }, 300)
    } else if (event === "updateColumn") {
      const column = args[0]
      const index = mockData.columns.findIndex((col) => col.id === column.id)
      if (index !== -1) {
        const oldColumn = { ...mockData.columns[index] }
        mockData.columns[index].title = column.title

        // Add to history
        this.addToHistory({
          type: "UPDATE_COLUMN",
          payload: { oldColumn, newColumn: column },
        })

        setTimeout(() => {
          this.broadcast("columnUpdated", column)
        }, 300)
      }
    } else if (event === "deleteColumn") {
      const columnId = args[0]
      const columnIndex = mockData.columns.findIndex((col) => col.id === columnId)
      if (columnIndex !== -1) {
        const deletedColumn = { ...mockData.columns[columnIndex] }
        const columnOrderIndex = mockData.columnOrder.indexOf(columnId)

        mockData.columns = mockData.columns.filter((col) => col.id !== columnId)
        mockData.columnOrder = mockData.columnOrder.filter((id) => id !== columnId)

        // Add to history
        this.addToHistory({
          type: "DELETE_COLUMN",
          payload: { column: deletedColumn, columnIndex, columnOrderIndex },
        })

        setTimeout(() => {
          this.broadcast("columnDeleted", columnId)
        }, 300)
      }
    } else if (event === "addTask") {
      const task = args[0]
      // Ensure task has all required fields
      task.comments = task.comments || []
      task.dueDate = task.dueDate || null
      task.assignedTo = task.assignedTo || null

      mockData.tasks[task.id] = task
      const column = mockData.columns.find((col) => col.id === task.columnId)
      if (column) {
        column.taskIds.push(task.id)

        // Add to history
        this.addToHistory({
          type: "ADD_TASK",
          payload: { task, columnId: task.columnId },
        })

        setTimeout(() => {
          this.broadcast("taskAdded", task)
        }, 300)
      }
    } else if (event === "updateTask") {
      const task = args[0]
      if (mockData.tasks[task.id]) {
        const oldTask = { ...mockData.tasks[task.id] }
        mockData.tasks[task.id] = {
          ...mockData.tasks[task.id],
          ...task,
          updatedAt: new Date().toISOString(),
        }

        // Add to history
        this.addToHistory({
          type: "UPDATE_TASK",
          payload: { oldTask, newTask: mockData.tasks[task.id] },
        })

        setTimeout(() => {
          this.broadcast("taskUpdated", mockData.tasks[task.id])
        }, 300)
      }
    } else if (event === "deleteTask") {
      const taskId = args[0]
      if (mockData.tasks[taskId]) {
        const deletedTask = { ...mockData.tasks[taskId] }
        let columnId = null
        let taskIndex = -1

        // Find which column contains this task
        mockData.columns.forEach((column) => {
          const index = column.taskIds.indexOf(taskId)
          if (index !== -1) {
            columnId = column.id
            taskIndex = index
          }
        })

        delete mockData.tasks[taskId]
        mockData.columns.forEach((column) => {
          column.taskIds = column.taskIds.filter((id) => id !== taskId)
        })

        // Add to history
        this.addToHistory({
          type: "DELETE_TASK",
          payload: { task: deletedTask, columnId, taskIndex },
        })

        setTimeout(() => {
          this.broadcast("taskDeleted", taskId)
        }, 300)
      }
    } else if (event === "moveTask") {
      const { source, destination } = args[0]
      if (!destination) return

      const sourceColumn = mockData.columns.find((col) => col.id === source.droppableId)
      const destColumn = mockData.columns.find((col) => col.id === destination.droppableId)

      if (sourceColumn && destColumn) {
        const taskId = sourceColumn.taskIds[source.index]
        const [movedTaskId] = sourceColumn.taskIds.splice(source.index, 1)
        destColumn.taskIds.splice(destination.index, 0, movedTaskId)

        // Add to history
        this.addToHistory({
          type: "MOVE_TASK",
          payload: {
            taskId,
            source: { ...source },
            destination: { ...destination },
          },
        })

        setTimeout(() => {
          this.broadcast("taskMoved", args[0])
        }, 300)
      }
    } else if (event === "moveColumn") {
      const { sourceIndex, destinationIndex } = args[0]
      const [movedColumnId] = mockData.columnOrder.splice(sourceIndex, 1)
      mockData.columnOrder.splice(destinationIndex, 0, movedColumnId)

      // Add to history
      this.addToHistory({
        type: "MOVE_COLUMN",
        payload: {
          columnId: movedColumnId,
          sourceIndex,
          destinationIndex,
        },
      })

      setTimeout(() => {
        this.broadcast("columnMoved", args[0])
      }, 300)
    } else if (event === "addComment") {
      const { taskId, comment } = args[0]

      // Check if this comment is already being processed
      const commentKey = `${taskId}-${comment.id}`
      if (this.pendingComments.has(commentKey)) {
        console.log("Duplicate comment detected, ignoring:", commentKey)
        return
      }

      // Mark this comment as being processed
      this.pendingComments.add(commentKey)

      if (mockData.tasks[taskId]) {
        if (!mockData.tasks[taskId].comments) {
          mockData.tasks[taskId].comments = []
        }

        // Add the comment to the task
        mockData.tasks[taskId].comments.push(comment)

        // Add to history
        this.addToHistory({
          type: "ADD_COMMENT",
          payload: { taskId, comment },
        })

        // Notify all clients about the new comment
        if (this.listeners["commentAdded"]) {
          this.listeners["commentAdded"].forEach((callback) => {
            callback({ taskId, comment })
          })
        }

        // Remove from pending after processing
        setTimeout(() => {
          this.pendingComments.delete(commentKey)
        }, 1000)
      }
    } else if (event === "deleteComment") {
      const { taskId, commentId } = args[0]
      if (mockData.tasks[taskId] && mockData.tasks[taskId].comments) {
        const commentIndex = mockData.tasks[taskId].comments.findIndex((c) => c.id === commentId)
        if (commentIndex !== -1) {
          const deletedComment = { ...mockData.tasks[taskId].comments[commentIndex] }
          mockData.tasks[taskId].comments = mockData.tasks[taskId].comments.filter((c) => c.id !== commentId)

          // Add to history
          this.addToHistory({
            type: "DELETE_COMMENT",
            payload: { taskId, comment: deletedComment, commentIndex },
          })

          // Notify all clients
          if (this.listeners["commentDeleted"]) {
            this.listeners["commentDeleted"].forEach((callback) => {
              callback({ taskId, commentId })
            })
          }
        }
      }
    } else if (event === "updateDueDate") {
      const { taskId, dueDate } = args[0]
      if (mockData.tasks[taskId]) {
        const oldDueDate = mockData.tasks[taskId].dueDate
        mockData.tasks[taskId].dueDate = dueDate

        // Add to history
        this.addToHistory({
          type: "UPDATE_DUE_DATE",
          payload: { taskId, oldDueDate, newDueDate: dueDate },
        })

        setTimeout(() => {
          this.broadcast("dueDateUpdated", { taskId, dueDate })
        }, 300)
      }
    } else if (event === "assignTask") {
      const { taskId, userId } = args[0]
      if (mockData.tasks[taskId]) {
        const oldAssignedTo = mockData.tasks[taskId].assignedTo
        mockData.tasks[taskId].assignedTo = userId

        // Add to history
        this.addToHistory({
          type: "ASSIGN_TASK",
          payload: { taskId, oldAssignedTo, newAssignedTo: userId },
        })

        setTimeout(() => {
          this.broadcast("taskAssigned", { taskId, userId })
        }, 300)
      }
    } else if (event === "undo") {
      if (mockData.currentHistoryIndex > -1) {
        const action = mockData.history[mockData.currentHistoryIndex]
        this.applyUndo(action)
        mockData.currentHistoryIndex--

        setTimeout(() => {
          this.broadcast("historyChanged", {
            currentIndex: mockData.currentHistoryIndex,
            canUndo: mockData.currentHistoryIndex > -1,
            canRedo: mockData.currentHistoryIndex < mockData.history.length - 1,
          })
        }, 300)
      }
    } else if (event === "redo") {
      if (mockData.currentHistoryIndex < mockData.history.length - 1) {
        mockData.currentHistoryIndex++
        const action = mockData.history[mockData.currentHistoryIndex]
        this.applyRedo(action)

        setTimeout(() => {
          this.broadcast("historyChanged", {
            currentIndex: mockData.currentHistoryIndex,
            canUndo: mockData.currentHistoryIndex > -1,
            canRedo: mockData.currentHistoryIndex < mockData.history.length - 1,
          })
        }, 300)
      }
    } else if (event === "setActivity") {
      const { action, itemId } = args[0]
      this.activeUsers[userId] = { action, itemId, timestamp: Date.now() }

      setTimeout(() => {
        this.broadcast("userActive", {
          userId,
          action,
          itemId,
        })
      }, 300)

      if (action === "viewing") {
        delete this.activeUsers[userId]
        setTimeout(() => {
          this.broadcast("userInactive", userId)
        }, 300)
      }
    }

    // Call any registered callbacks for this event (except for commentAdded which is handled specially)
    if (this.listeners[event] && event !== "addComment" && event !== "commentAdded") {
      this.listeners[event].forEach((callback) => {
        callback(...args)
      })
    }

    return this
  }

  // Add action to history
  addToHistory(action) {
    // If we're in the middle of the history, remove all future actions
    if (mockData.currentHistoryIndex < mockData.history.length - 1) {
      mockData.history = mockData.history.slice(0, mockData.currentHistoryIndex + 1)
    }

    // Add the new action
    mockData.history.push(action)
    mockData.currentHistoryIndex = mockData.history.length - 1

    // Limit history size
    if (mockData.history.length > 50) {
      mockData.history.shift()
      mockData.currentHistoryIndex--
    }
  }

  // Apply undo for an action
  applyUndo(action) {
    switch (action.type) {
      case "ADD_COLUMN":
        // Remove the added column
        mockData.columns = mockData.columns.filter((col) => col.id !== action.payload.id)
        mockData.columnOrder = mockData.columnOrder.filter((id) => id !== action.payload.id)
        this.broadcast("columnDeleted", action.payload.id)
        break

      case "UPDATE_COLUMN":
        // Restore the old column
        const colIndex = mockData.columns.findIndex((col) => col.id === action.payload.oldColumn.id)
        if (colIndex !== -1) {
          mockData.columns[colIndex] = action.payload.oldColumn
          this.broadcast("columnUpdated", action.payload.oldColumn)
        }
        break

      case "DELETE_COLUMN":
        // Restore the deleted column
        mockData.columns.splice(action.payload.columnIndex, 0, action.payload.column)
        mockData.columnOrder.splice(action.payload.columnOrderIndex, 0, action.payload.column.id)
        this.broadcast("columnAdded", action.payload.column)
        break

      case "ADD_TASK":
        // Remove the added task
        delete mockData.tasks[action.payload.task.id]
        const colForTask = mockData.columns.find((col) => col.id === action.payload.columnId)
        if (colForTask) {
          colForTask.taskIds = colForTask.taskIds.filter((id) => id !== action.payload.task.id)
        }
        this.broadcast("taskDeleted", action.payload.task.id)
        break

      case "UPDATE_TASK":
        // Restore the old task
        mockData.tasks[action.payload.oldTask.id] = action.payload.oldTask
        this.broadcast("taskUpdated", action.payload.oldTask)
        break

      case "DELETE_TASK":
        // Restore the deleted task
        mockData.tasks[action.payload.task.id] = action.payload.task
        if (action.payload.columnId) {
          const col = mockData.columns.find((col) => col.id === action.payload.columnId)
          if (col) {
            col.taskIds.splice(action.payload.taskIndex, 0, action.payload.task.id)
          }
        }
        this.broadcast("taskAdded", action.payload.task)
        break

      case "MOVE_TASK":
        // Move the task back
        this.moveTaskForUndoRedo(action.payload.taskId, action.payload.destination, action.payload.source)
        this.broadcast("taskMoved", {
          source: action.payload.destination,
          destination: action.payload.source,
        })
        break

      case "MOVE_COLUMN":
        // Move the column back
        const [movedColId] = mockData.columnOrder.splice(action.payload.destinationIndex, 1)
        mockData.columnOrder.splice(action.payload.sourceIndex, 0, movedColId)
        this.broadcast("columnMoved", {
          sourceIndex: action.payload.destinationIndex,
          destinationIndex: action.payload.sourceIndex,
        })
        break

      case "ADD_COMMENT":
        // Remove the added comment
        if (mockData.tasks[action.payload.taskId]) {
          mockData.tasks[action.payload.taskId].comments = mockData.tasks[action.payload.taskId].comments.filter(
            (c) => c.id !== action.payload.comment.id,
          )
          this.broadcast("commentDeleted", {
            taskId: action.payload.taskId,
            commentId: action.payload.comment.id,
          })
        }
        break

      case "DELETE_COMMENT":
        // Restore the deleted comment
        if (mockData.tasks[action.payload.taskId]) {
          if (!mockData.tasks[action.payload.taskId].comments) {
            mockData.tasks[action.payload.taskId].comments = []
          }
          mockData.tasks[action.payload.taskId].comments.splice(action.payload.commentIndex, 0, action.payload.comment)
          this.broadcast("commentAdded", {
            taskId: action.payload.taskId,
            comment: action.payload.comment,
          })
        }
        break

      case "UPDATE_DUE_DATE":
        // Restore the old due date
        if (mockData.tasks[action.payload.taskId]) {
          mockData.tasks[action.payload.taskId].dueDate = action.payload.oldDueDate
          this.broadcast("dueDateUpdated", {
            taskId: action.payload.taskId,
            dueDate: action.payload.oldDueDate,
          })
        }
        break

      case "ASSIGN_TASK":
        // Restore the old assignment
        if (mockData.tasks[action.payload.taskId]) {
          mockData.tasks[action.payload.taskId].assignedTo = action.payload.oldAssignedTo
          this.broadcast("taskAssigned", {
            taskId: action.payload.taskId,
            userId: action.payload.oldAssignedTo,
          })
        }
        break
    }
  }

  // Apply redo for an action
  applyRedo(action) {
    switch (action.type) {
      case "ADD_COLUMN":
        // Re-add the column
        mockData.columns.push(action.payload)
        mockData.columnOrder.push(action.payload.id)
        this.broadcast("columnAdded", action.payload)
        break

      case "UPDATE_COLUMN":
        // Apply the update again
        const colIndex = mockData.columns.findIndex((col) => col.id === action.payload.newColumn.id)
        if (colIndex !== -1) {
          mockData.columns[colIndex].title = action.payload.newColumn.title
          this.broadcast("columnUpdated", action.payload.newColumn)
        }
        break

      case "DELETE_COLUMN":
        // Delete the column again
        mockData.columns = mockData.columns.filter((col) => col.id !== action.payload.column.id)
        mockData.columnOrder = mockData.columnOrder.filter((id) => id !== action.payload.column.id)
        this.broadcast("columnDeleted", action.payload.column.id)
        break

      case "ADD_TASK":
        // Re-add the task
        mockData.tasks[action.payload.task.id] = action.payload.task
        const colForTask = mockData.columns.find((col) => col.id === action.payload.columnId)
        if (colForTask) {
          colForTask.taskIds.push(action.payload.task.id)
        }
        this.broadcast("taskAdded", action.payload.task)
        break

      case "UPDATE_TASK":
        // Apply the update again
        mockData.tasks[action.payload.newTask.id] = action.payload.newTask
        this.broadcast("taskUpdated", action.payload.newTask)
        break

      case "DELETE_TASK":
        // Delete the task again
        delete mockData.tasks[action.payload.task.id]
        mockData.columns.forEach((column) => {
          const col = column
          col.taskIds = col.taskIds.filter((id) => id !== action.payload.task.id)
        })
        this.broadcast("taskDeleted", action.payload.task.id)
        break

      case "MOVE_TASK":
        // Move the task again
        this.moveTaskForUndoRedo(action.payload.taskId, action.payload.source, action.payload.destination)
        this.broadcast("taskMoved", {
          source: action.payload.source,
          destination: action.payload.destination,
        })
        break

      case "MOVE_COLUMN":
        // Move the column again
        const [movedColId] = mockData.columnOrder.splice(action.payload.sourceIndex, 1)
        mockData.columnOrder.splice(action.payload.destinationIndex, 0, movedColId)
        this.broadcast("columnMoved", {
          sourceIndex: action.payload.sourceIndex,
          destinationIndex: action.payload.destinationIndex,
        })
        break

      case "ADD_COMMENT":
        // Re-add the comment
        if (mockData.tasks[action.payload.taskId]) {
          if (!mockData.tasks[action.payload.taskId].comments) {
            mockData.tasks[action.payload.taskId].comments = []
          }
          mockData.tasks[action.payload.taskId].comments.push(action.payload.comment)
          this.broadcast("commentAdded", {
            taskId: action.payload.taskId,
            comment: action.payload.comment,
          })
        }
        break

      case "DELETE_COMMENT":
        // Delete the comment again
        if (mockData.tasks[action.payload.taskId] && mockData.tasks[action.payload.taskId].comments) {
          mockData.tasks[action.payload.taskId].comments = mockData.tasks[action.payload.taskId].comments.filter(
            (c) => c.id !== action.payload.comment.id,
          )
          this.broadcast("commentDeleted", {
            taskId: action.payload.taskId,
            commentId: action.payload.comment.id,
          })
        }
        break

      case "UPDATE_DUE_DATE":
        // Apply the due date update again
        if (mockData.tasks[action.payload.taskId]) {
          mockData.tasks[action.payload.taskId].dueDate = action.payload.newDueDate
          this.broadcast("dueDateUpdated", {
            taskId: action.payload.taskId,
            dueDate: action.payload.newDueDate,
          })
        }
        break

      case "ASSIGN_TASK":
        // Apply the assignment again
        if (mockData.tasks[action.payload.taskId]) {
          mockData.tasks[action.payload.taskId].assignedTo = action.payload.newAssignedTo
          this.broadcast("taskAssigned", {
            taskId: action.payload.taskId,
            userId: action.payload.newAssignedTo,
          })
        }
        break
    }
  }

  // Helper function for moving tasks in undo/redo
  moveTaskForUndoRedo(taskId, source, destination) {
    const sourceColumn = mockData.columns.find((col) => col.id === source.droppableId)
    const destColumn = mockData.columns.find((col) => col.id === destination.droppableId)

    if (sourceColumn && destColumn) {
      // Remove from source
      sourceColumn.taskIds = sourceColumn.taskIds.filter((id) => id !== taskId)

      // Add to destination
      destColumn.taskIds.splice(destination.index, 0, taskId)
    }
  }

  // Simulate broadcast to other clients (excluding sender)
  broadcast(event, ...args) {
    // In a real Socket.IO implementation, broadcasts don't go back to the sender
    // So we'll just log the broadcast but not trigger the event on this client
    console.log(`Broadcasting ${event} to other clients`, ...args)

    // In a real implementation with multiple clients, this would emit to others
    // For demo purposes in preview mode, we'll skip triggering the event
    // This prevents duplicate actions from occurring
  }

  disconnect() {
    console.log("Mock socket disconnected")
    return this
  }
}

export const connectSocket = () => {
  if (!socket) {
    try {
      // Always use mock implementation since no env variables are set
      console.log("Using mock Socket.IO implementation")
      socket = new MockSocket()
    } catch (error) {
      console.error("Error initializing socket:", error)
      // Fallback to mock implementation
      socket = new MockSocket()
    }
  }

  return socket
}

// Export the socket instance and user info
export { socket, userId, userName }
