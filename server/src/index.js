// Server
import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"

// Database
import "./database/db.js" // TODO: is this actually used here? on that note, at some point comb through all the imports and eliminate all unnecessary ones.
import User from "./database/User.js"

// Middleware
import cors from "cors"

// Controllers
import {
  createRoom,
  joinRoom,
  handleCountdownStart,
  handleCountdownStop,
  handleMatchmaking,
} from "./controllers/roomController.js"

// Services
import {
  handleNewConnection,
  dbCreateNewUser,
  dbGetUserById,
  dbGetUserByName,
  handleUserDisconnect,
  handleLeaveRoom,
} from "./services/userService.js"
import { handleDisplayNameUpdate } from "./services/roomService.js"
import {
  handleLoadUser,
  handleWrongGuess,
  handleCorrectGuess,
  handleOutOfGuesses,
  handleGameJoinedInProgress,
} from "./services/gameService.js"

// Server setup
const app = express()
const httpServer = createServer(app)

app.use(cors())

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
})

// Endpoints
app.get("/user/:username", async (req, res) => {
  const username = req.params.username
  try {
    if (username) {
      const user = await dbGetUserByName(username)

      if (user) {
        res.send(user)
      }
    }
  } catch (error) {
    console.error(`Error fetching user by username: ${error.message}`)
    res.send({ error: error.message })
  }
}) // TODO: Maybe only send the specific stats requested instead of the whole obj?

app.get("/users/duplicate/:username", async (req, res) => {
  const usernameToTest = req.params.username

  if (usernameToTest) {
    try {
      const existingUsername = await dbGetUserByName(usernameToTest)
      if (existingUsername) {
        res.send({ isDuplicateUsername: true })
      } else {
        res.send({ isDuplicateUsername: false })
      }
    } catch (error) {
      console.error(`Error checking for duplicate username: ${error.message}`)
      res.send({ isDuplicateUsername: undefined })
    }
  } else {
    res.send({ isDuplicateUsername: undefined })
  }
})

// Socket.IO
io.on("connection", (socket) => {
  console.log(`A user connected with socketId: ${socket.id}`)

  socket.on("newConnection", (userId) => handleNewConnection(userId, socket))

  socket.on("createNewUser", (userId, username) =>
    dbCreateNewUser(userId, username, socket)
  )

  // Interact with WaitingRoom component
  // Find match
  socket.on("findMatch", (gameMode) => handleMatchmaking(gameMode, socket))
  // Create room
  socket.on("createRoom", (connectionMode, gameMode) =>
    createRoom(connectionMode, gameMode, socket)
  )
  // Join room
  socket.on("joinRoom", (roomId, displayName) =>
    joinRoom(roomId, displayName, io, socket)
  )
  // DisplayName update
  socket.on("updateDisplayName", (roomId, updatedDisplayName) =>
    handleDisplayNameUpdate(roomId, socket.userId, updatedDisplayName, io)
  )
  // Start countdown before starting the game -> navigate to game room
  socket.on("startCountdown", (roomId) => handleCountdownStart(roomId, io))
  // Stop countdown - no longer enough users in the room
  socket.on("stopCountdown", (roomId) => handleCountdownStop(roomId, io))

  // Interact with GameContainer component
  socket.on("loadUser", (roomId) => handleLoadUser(roomId, socket.userId, io))
  // General game flow
  socket.on("wrongGuess", (roomId, updatedGameBoard) =>
    handleWrongGuess(roomId, socket.userId, updatedGameBoard, io)
  )
  socket.on(
    "correctGuess",
    async (roomId, updatedGameBoard, correctGuessIndex) =>
      await handleCorrectGuess(
        roomId,
        socket.userId,
        updatedGameBoard,
        correctGuessIndex,
        socket,
        io
      )
  )
  socket.on("outOfGuesses", (roomId) =>
    handleOutOfGuesses(roomId, socket.userId, io)
  )
  socket.on("gameJoinedInProgress", (roomId) =>
    handleGameJoinedInProgress(roomId, socket)
  )

  // User disconnect and cleanup
  socket.on("disconnecting", async () => await handleUserDisconnect(socket, io))
  socket.on("leaveRoom", async () => await handleLeaveRoom(socket, io))
})

const PORT = 3005

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

// For helpful output when debugging hanging promises
process.on("unhandledRejection", (reason, promise) => {
  console.error(`Unhandled rejection at: ${promise}, reason: ${reason}`)
})
