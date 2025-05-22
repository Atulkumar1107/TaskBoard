import { Server } from "socket.io"

// Mock database for development
const boardData = {
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
    },
    "task-2": {
      id: "task-2",
      title: "Implement drag and drop",
      description: "Add the ability to drag tasks between columns",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    "task-3": {
      id: "task-3",
      title: "Add real-time updates",
      description: "Implement Socket.IO for real-time collaboration",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    "task-4": {
      id: "task-4",
      title: "Style the UI",
      description: "Add responsive styling with Tailwind CSS",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    "task-5": {
      id: "task-5",
      title: "Add user presence",
      description: "Show which users are online and what they're editing",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    "task-6": {
      id: "task-6",
      title: "Write documentation",
      description: "Create a README with setup instructions",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  columnOrder: ["column-1", "column-2", "column-3"],
}

// Track connected users
const connectedUsers = new Map()
const activeUsers = new Map()

export async function GET(req) {
  return new Response(JSON.stringify({ message: "Socket.IO server endpoint" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

export async function POST(req) {
  return new Response(JSON.stringify({ message: "Socket.IO server endpoint" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  })
}

// This is a workaround for Next.js API routes with Socket.IO
// In a production environment, you would use a separate Socket.IO server
let io

if (!io) {
  // Create a new Socket.IO server
  io = new Server({
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  })

  // Listen for connections
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId
    console.log(`User connected: ${userId}`)

    // Add user to connected users
    connectedUsers.set(userId, socket.id)

    // Broadcast updated user count
    io.emit("onlineUsers", connectedUsers.size)

    // Send initial data to the client
    socket.on("getInitialData", () => {
      socket.emit("initialData", boardData)
    })

    // Handle column operations
    socket.on("addColumn", (column) => {
      boardData.columns.push(column)
      boardData.columnOrder.push(column.id)
      socket.broadcast.emit("columnAdded", column)
    })

    socket.on("updateColumn", (column) => {
      const index = boardData.columns.findIndex((col) => col.id === column.id)
      if (index !== -1) {
        boardData.columns[index].title = column.title
        socket.broadcast.emit("columnUpdated", column)
      }
    })

    socket.on("deleteColumn", (columnId) => {
      const column = boardData.columns.find((col) => col.id === columnId)
      if (column) {
        // Remove tasks in this column
        column.taskIds.forEach((taskId) => {
          delete boardData.tasks[taskId]
        })

        // Remove column
        boardData.columns = boardData.columns.filter((col) => col.id !== columnId)
        boardData.columnOrder = boardData.columnOrder.filter((id) => id !== columnId)

        socket.broadcast.emit("columnDeleted", columnId)
      }
    })

    // Handle task operations
    socket.on("addTask", (task) => {
      boardData.tasks[task.id] = task
      const column = boardData.columns.find((col) => col.id === task.columnId)
      if (column) {
        column.taskIds.push(task.id)
        socket.broadcast.emit("taskAdded", task)
      }
    })

    socket.on("updateTask", (task) => {
      if (boardData.tasks[task.id]) {
        boardData.tasks[task.id] = {
          ...boardData.tasks[task.id],
          title: task.title,
          description: task.description,
          updatedAt: new Date().toISOString(),
        }
        socket.broadcast.emit("taskUpdated", task)
      }
    })

    socket.on("deleteTask", (taskId) => {
      if (boardData.tasks[taskId]) {
        delete boardData.tasks[taskId]

        // Remove task from any column
        boardData.columns.forEach((column) => {
          column.taskIds = column.taskIds.filter((id) => id !== taskId)
        })

        socket.broadcast.emit("taskDeleted", taskId)
      }
    })

    // Handle drag and drop operations
    socket.on("moveTask", (moveData) => {
      const { source, destination } = moveData

      // If dropped outside a droppable area
      if (!destination) return

      // Find source and destination columns
      const sourceColumn = boardData.columns.find((col) => col.id === source.droppableId)
      const destColumn = boardData.columns.find((col) => col.id === destination.droppableId)

      if (!sourceColumn || !destColumn) return

      // Remove task from source column
      const [movedTaskId] = sourceColumn.taskIds.splice(source.index, 1)

      // Add task to destination column
      destColumn.taskIds.splice(destination.index, 0, movedTaskId)

      socket.broadcast.emit("taskMoved", moveData)
    })

    socket.on("moveColumn", (moveData) => {
      const { sourceIndex, destinationIndex } = moveData

      // Move column in the order array
      const [movedColumnId] = boardData.columnOrder.splice(sourceIndex, 1)
      boardData.columnOrder.splice(destinationIndex, 0, movedColumnId)

      socket.broadcast.emit("columnMoved", moveData)
    })

    // Handle user activity
    socket.on("setActivity", (activityData) => {
      const { action, itemId } = activityData

      // Update active users map
      activeUsers.set(userId, { action, itemId, timestamp: Date.now() })

      // Broadcast user activity to all clients
      socket.broadcast.emit("userActive", {
        userId,
        action,
        itemId,
      })

      // If user is no longer editing, remove from active users
      if (action === "viewing") {
        activeUsers.delete(userId)
        socket.broadcast.emit("userInactive", userId)
      }
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`)

      // Remove user from connected users
      connectedUsers.delete(userId)

      // Remove user from active users
      activeUsers.delete(userId)

      // Broadcast updated user count and inactive status
      io.emit("onlineUsers", connectedUsers.size)
      io.emit("userInactive", userId)
    })
  })

  // Start the Socket.IO server
  io.listen(3001)
}

export const config = {
  api: {
    bodyParser: false,
  },
}
