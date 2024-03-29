import React from "react"
import { Routes, Route } from "react-router-dom"
import { AnimatePresence } from "framer-motion"

// Components
import WelcomeMessage from "./WelcomeMessage"
import MenuLandingPage from "./MenuLandingPage"
import MenuOnlineModes from "./MenuOnlineModes"
import MenuOfflineModes from "./MenuOfflineModes"
import WaitingRoom from "./WaitingRoom"
import ChallengeForm from "./ChallengeForm"

function MenuRoutes({
  isFirstTimeVisitor,
  displayName,
  setDisplayName,
  inputWidth,
  setInputWidth,
  isSocketConnected,
  gameMode,
  setGameMode,
  isLetterEliminationOn,
  setIsLetterEliminationOn,
  connectionMode,
  setConnectionMode,
  isHost,
  setIsHost,
  setIsSpectating,
  roomId,
  setRoomId,
}) {
  return (
    <>
      <WelcomeMessage
        isFirstTimeVisitor={isFirstTimeVisitor}
        displayName={displayName}
        setDisplayName={setDisplayName}
        inputWidth={inputWidth}
        setInputWidth={setInputWidth}
      />
      {!roomId && (
        <ChallengeForm
          isFirstTimeVisitor={isFirstTimeVisitor}
          gameMode={gameMode}
          setGameMode={setGameMode}
        />
      )}
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<MenuLandingPage setRoomId={setRoomId} />} />
          <Route
            path="/online"
            element={
              <MenuOnlineModes
                gameMode={gameMode}
                setConnectionMode={setConnectionMode}
                setIsHost={setIsHost}
                setRoomId={setRoomId}
              />
            }
          />
          <Route
            path="/offline"
            element={
              <MenuOfflineModes
                setConnectionMode={setConnectionMode}
                setRoomId={setRoomId}
              />
            }
          />
          <Route
            path="/room/:roomId"
            element={
              <WaitingRoom
                displayName={displayName}
                isSocketConnected={isSocketConnected}
                connectionMode={connectionMode}
                setConnectionMode={setConnectionMode}
                gameMode={gameMode}
                setGameMode={setGameMode}
                isLetterEliminationOn={isLetterEliminationOn}
                setIsLetterEliminationOn={setIsLetterEliminationOn}
                isHost={isHost}
                setIsHost={setIsHost}
                setIsSpectating={setIsSpectating}
                roomId={roomId}
                setRoomId={setRoomId}
              />
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default MenuRoutes
