import React from "react"

// Components
import GameBoard from "./GameBoard"
import OnlineGameBoardContainer from "./OnlineGameBoardContainer"

function GameBoardContainer({
  connectionMode,
  board,
  activeRow,
  activeCell,
  userInfo,
  isOutOfGuesses,
  isSpectating,
  isGameOver,
  showAlertModal,
  setShowAlertModal,
  message,
  hasSolved,
  isConfettiRunning,
  winningUserId,
  isPhoneLayout,
}) {
  return (
    <>
      {connectionMode === "offline" ? (
        <div className="offline-board">
          <GameBoard
            board={board}
            activeRow={activeRow}
            activeCell={activeCell}
            connectionMode={connectionMode}
            isOutOfGuesses={isOutOfGuesses}
            isUser={true}
            isGameOver={isGameOver}
            showAlertModal={showAlertModal}
            setShowAlertModal={setShowAlertModal}
            message={message}
            hasSolved={hasSolved}
            isConfettiRunning={isConfettiRunning}
          />
        </div>
      ) : (
        <OnlineGameBoardContainer
          connectionMode={connectionMode}
          board={board}
          activeRow={activeRow}
          activeCell={activeCell}
          userInfo={userInfo}
          isOutOfGuesses={isOutOfGuesses}
          isSpectating={isSpectating}
          isGameOver={isGameOver}
          showAlertModal={showAlertModal}
          setShowAlertModal={setShowAlertModal}
          message={message}
          hasSolved={hasSolved}
          isConfettiRunning={isConfettiRunning}
          winningUserId={winningUserId}
          isPhoneLayout={isPhoneLayout}
        />
      )}
    </>
  )
}

export default GameBoardContainer
