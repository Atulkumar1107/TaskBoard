// app/api/comments/route.js (Client-side approach)
import { v4 as uuidv4 } from "uuid"

export async function POST(request) {
  const data = await request.json()
  const { taskId, text, author } = data

  // Create the comment
  const comment = {
    id: uuidv4(),
    text,
    author,
    createdAt: new Date().toISOString(),
  }

  // Just return the comment data - let client handle socket emission
  return new Response(JSON.stringify({ success: true, comment }), {
    headers: {
      "Content-Type": "application/json",
    },
  })
}

export async function DELETE(request) {
  const data = await request.json()
  const { taskId, commentId } = data

  // Just confirm deletion - let client handle socket emission
  return new Response(JSON.stringify({ success: true, taskId, commentId }), {
    headers: {
      "Content-Type": "application/json",
    },
  })
}

// ==========================================
// CLIENT COMPONENT USAGE:
// ==========================================

// In your React component:
import { socket } from "@/lib/socket"

const addComment = async (taskId, text, author) => {
  try {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskId, text, author })
    })

    const result = await response.json()
    
    if (result.success) {
      // Emit socket event from client side
      socket.emit("addComment", { taskId, comment: result.comment })
    }
  } catch (error) {
    console.error("Failed to add comment:", error)
  }
}

const deleteComment = async (taskId, commentId) => {
  try {
    const response = await fetch('/api/comments', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskId, commentId })
    })

    const result = await response.json()
    
    if (result.success) {
      // Emit socket event from client side
      socket.emit("deleteComment", { taskId, commentId })
    }
  } catch (error) {
    console.error("Failed to delete comment:", error)
  }
}