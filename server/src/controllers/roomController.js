// Services
import { initializeGameBoard } from '../services/gameService.js'
import { initializeRoom, getRoomConnectionMode, getRoomGameMode, roomExists } from '../services/roomService.js'
import { setUsername } from '../services/userService.js'

function createRoom(connectionMode, gameMode, socket) {
    const roomId = initializeRoom(connectionMode, gameMode)

    console.log(`Creating room: ${roomId}`)
    socket.emit('roomCreated', roomId)
}

function joinRoom(roomId, username, io, socket) {
    if (roomExists(roomId)) {
        console.log(`${socket.id} joining room: ${roomId}`)
        socket.join(roomId)

        setUsername(roomId, username, io, socket)
        initializeGameBoard(roomId, socket)
        socket.emit('roomJoined', getRoomConnectionMode(roomId), getRoomGameMode(roomId))
    }
}

function startRoom(roomId, io) {
    if (roomExists(roomId)) {
        io.to(roomId).emit('roomStarted')
    }
}

export { createRoom, joinRoom, startRoom }