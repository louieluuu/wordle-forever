import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import socket from '../socket'

// Components
import WelcomeMessage from './WelcomeMessage'

function WaitingRoom({
    username,
    setUsername,
    inputWidth,
    setInputWidth,
    setConnectionMode,
    setGameMode,
}) {
    const navigate = useNavigate()
    const { roomId } = useParams()
    const [userInfo, setUserInfo] = useState([])

    // Main useEffect loop
    useEffect(() => {

        if (socket.id === undefined) {
            socket.on('connect', () => {
                socket.emit('joinRoom', roomId, username)
            })
        } else {
            socket.emit('joinRoom', roomId, username)
        }

        // Make sure modes are set, important for users joining from a link
        socket.on('roomJoined', (connectionMode, gameMode) => {
            setConnectionMode(connectionMode)
            setGameMode(gameMode)
        })

        socket.on('roomError', (errorMessage) => {
            console.log(`Error: ${errorMessage}`)
        })

        socket.on('userInfoUpdated', (updatedUserInfo) => {
            setUserInfo(updatedUserInfo)
        })

        socket.on('roomStarted', () => {
            navigate(`/game/${roomId}`)
        })

        return () => {
            socket.off('connect')
            socket.off('roomError')
            socket.off('userInfoUpdated')
            socket.off('roomStarted')
        }
    }, [])

    // Keep username up to date
    useEffect(() => {
        socket.emit('updateUsername', roomId, username)
    }, [username])

    function startRoom() {
        socket.emit('startRoom', roomId)
    }

  return (
    <div>
        <WelcomeMessage
            username={username}
            setUsername={setUsername}
            inputWidth={inputWidth}
            setInputWidth={setInputWidth}
        />
        <h2>Waiting Room</h2>
        <p>Room ID: {roomId}</p>
        <button
            onClick={() => {
            navigator.clipboard.writeText(window.location.href)
            }}
        >
            Copy Link
        </button>

        <div>
            <h3>Users in the Room:</h3>
            <ul>
                {userInfo.map((info) => (
                    <li key={info.socketId}>{info.username}</li>
                ))}
            </ul>
        </div>

        <button onClick={startRoom}>
            Start Game
        </button>
    </div>
  )
}

export default WaitingRoom