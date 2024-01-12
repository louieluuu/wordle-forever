// Services
import {
  initializeRoom,
  roomInLobby,
  isRoomFull,
  resetCountdown,
  addUserToRoom,
  getRoomConnectionMode,
  hasCountdownStarted,
  setCountdownStarted,
  findMatchingRoom,
  isRoomChallengeMode,
} from "../services/roomService.js"
import { setUsername, broadcastUserInfo } from "../services/userService.js"

const PRIVATE_ROOM_COUNTDOWN_TIMER = 6
const PUBLIC_ROOM_COUNTDOWN_TIMER = 6

function createRoom(connectionMode, isChallengeOn, socket) {
  try {
    const roomId = initializeRoom(connectionMode, isChallengeOn, socket.id)
    console.log(`Creating room: ${roomId}`)
    socket.emit("roomCreated", roomId)
  } catch (error) {
    console.error(`Error creating room: ${error.message}`)
    throw error
  }
}

async function joinRoom(roomId, username, io, socket) {
  try {
    if (roomInLobby(roomId) && !isRoomFull(roomId)) {
      console.log(`${socket.id} joining room: ${roomId}`)
      socket.join(roomId)
      socket.roomId = roomId
      await addUserToRoom(socket.id, roomId)
      await setUsername(socket.id, username)
      await broadcastUserInfo(roomId, io)
      socket.emit(
        "roomJoined",
        getRoomConnectionMode(roomId),
        isRoomChallengeMode(roomId)
      )
    } else {
      console.log(`${socket.id} failed to join room: ${roomId}`)
      socket.emit("failedToJoinRoom")
    }
  } catch (error) {
    console.error(`Error joining room: ${error.message}`)
    throw error
  }
}

function handleCountdownStart(roomId, io) {
  if (!hasCountdownStarted(roomId)) {
    setCountdownStarted(roomId)
    io.to(roomId).emit("countdownStarted")
    let seconds
    const roomConnectionMode = getRoomConnectionMode(roomId)
    if (roomConnectionMode === "online-private") {
      seconds = PRIVATE_ROOM_COUNTDOWN_TIMER
    } else if (roomConnectionMode === "online-public") {
      seconds = PUBLIC_ROOM_COUNTDOWN_TIMER
    } else {
      seconds = PUBLIC_ROOM_COUNTDOWN_TIMER
    }

    const countdownInterval = setInterval(() => {
      if (!hasCountdownStarted(roomId)) {
        clearInterval(countdownInterval)
        return
      }
      seconds--
      io.to(roomId).emit("countdownTick", seconds)

      if (seconds === 3) {
        clearInterval(countdownInterval)
        startRoom(roomId, io)
      }
    }, 1000)
  }
}

function handleCountdownStop(roomId) {
  if (hasCountdownStarted(roomId)) {
    resetCountdown(roomId)
  }
}

function handleMatchmaking(isChallengeOn, socket) {
  const matchingRoomId = findMatchingRoom(isChallengeOn)
  if (matchingRoomId) {
    socket.emit("matchFound", matchingRoomId)
  } else {
    socket.emit("noMatchesFound")
  }
}

function startRoom(roomId, io) {
  if (roomId) {
    io.to(roomId).emit("roomStarted")
  }
}

export {
  createRoom,
  joinRoom,
  handleCountdownStart,
  handleCountdownStop,
  handleMatchmaking,
}
