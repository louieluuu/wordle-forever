import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

import { WAITING_ROOM_MESSAGES } from "../data/waitingRoomMessages"

import { socket } from "../socket"

function WaitingRoom({ isHost, setIsHost, gameMode, setGameMode, setRoom, nickname }) {
  const { roomId } = useParams()
  const [nicknames, setNicknames] = useState([])
  const [waitingMessage, setWaitingMessage] = useState("")
  const [isCopied, setIsCopied] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    if (socket.id === undefined) {
      socket.on("connect", () => {
        console.log("socket.id undefined, emitting from in here")
        socket.emit("joinRoom", roomId, socket.id, nickname)
      })
    }
    //
    else {
      console.log("else: just emitting right away")
      socket.emit("joinRoom", roomId, socket.id, nickname)
    }

    socket.on("roomError", (reason) => {
      console.log(`Error: ${reason}`)
    })
    // // Necessary to wrap joinRoom in connect event handler, because otherwise
    // // "joinRoom" will fire before the socket.id is actually defined
    // socket.on("connect", () => {
    //   console.log("WaitingRoom 1st useEffect (socket.on) firing...")

    //   socket.emit("joinRoom", roomId, socket.id, nickname)

    //   socket.on("roomError", (reason) => {
    //     console.log(`Error: ${reason}`)
    //   })
    // })

    socket.on("nicknamesChanged", (newNicknames) => {
      setNicknames(newNicknames)
    })

    return () => {
      socket.off("connect")
      socket.off("roomError")
      socket.off("nicknamesChanged")
    }
  }, [])

  useEffect(() => {
    console.log("WaitingRoom 2nd useEffect firing...")

    // If the user navigates to the waiting room directly (i.e. received a link
    // from a friend), set the gameMode to online-private.
    if (gameMode === "") {
      setGameMode("online-private")
    }

    console.log(`roomId: ${roomId}`)
    setRoom(roomId)

    const randomWaitingMessage =
      WAITING_ROOM_MESSAGES[Math.floor(Math.random() * WAITING_ROOM_MESSAGES.length)]
    setWaitingMessage(randomWaitingMessage)
  }, [])

  function copyLink() {
    const baseUrl = "http://localhost:5173"
    const roomLink = `${baseUrl}/room/${roomId}`
    navigator.clipboard.writeText(roomLink)
    setIsCopied(true)
  }

  function initializeRoom() {
    socket.emit("initializeRoom", roomId)

    socket.on("roomInitialized", (roomId) => {
      socket.emit("startNewGame", roomId)
    })
  }

  function leaveRoom() {
    socket.emit("leaveRoom", roomId)
    console.log(`Leaving room ${roomId}`)
    setGameMode("")
    setIsHost(false)
    navigate("/online")
  }

  // TODO: This is such a mess :) (to get a border around the flexbox that
  // TODO: doesn't span the whole width...)
  // TODO: Also, index isn't a reliable key - actually need the socket.id
  // TODO: But that's not available in the nicknames array... Lol
  return (
    <div className="flexbox1">
      <div className="flexbox2">
        <h1 style={{ fontFamily: "Suwannaphum", color: "hsl(0, 0%, 15%)" }}>[{waitingMessage}]</h1>

        {isHost && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <b style={{ fontWeight: 900 }}>1.&nbsp;&nbsp;</b>
            <button
              className="btn--new-game"
              style={{
                backgroundColor: "hsl(0,0%,90%)",
                borderColor: "hsl(0,0%,85%)",
                color: "black",
                fontWeight: "400",
              }}
              onClick={copyLink}>
              {isCopied ? "LINK COPIED" : "COPY LINK"}
            </button>
          </div>
        )}

        <div className="flexbox3">
          {nicknames.map((nickname, index) => (
            <p key={index}>{nickname}</p>
          ))}
        </div>

        {isHost && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <b style={{ fontWeight: 900 }}>2.&nbsp;&nbsp;</b>

            <button className="btn--new-game" onClick={initializeRoom}>
              START GAME
            </button>
          </div>
        )}
        <button
          onClick={leaveRoom}
          style={{
            border: "1px solid black",
            borderRadius: "0.3rem",
            paddingInline: "0.5rem",
            paddingBlock: "0.15rem",
            marginTop: "2rem",
          }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default WaitingRoom
