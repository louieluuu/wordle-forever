import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from 'cors'

// Controllers
import { createRoom, joinRoom, startRoom } from "./controllers/roomController.js"

// Services
import { setUsername, removeUser } from "./services/userService.js"
import { start } from "repl"

const app = express()
const server = createServer(app)

app.use(cors())

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  }
})

io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`)

  // Create room
  socket.on('createRoom', (connectionMode) => createRoom(connectionMode, socket))

  // Join room
  socket.on('joinRoom', (roomId, username) => joinRoom(roomId, username, io, socket))

  // Username update
  socket.on('updateUsername', (roomId, username) => setUsername(roomId, username, io, socket))

  // Start room
  socket.on('startRoom', (roomId) => startRoom(roomId, socket, io))

  // User disconnect and cleanup
  socket.on('disconnecting', () => removeUser(socket, io))

})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
