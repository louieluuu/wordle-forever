import React from "react"

import GameBoard from "./GameBoard"

function GameBoardContainer({
  connectionMode,
  board,
  activeRow,
  activeCell,
  username,
  userInfo,
}) {
  function otherUserInfo() {
    return userInfo.slice(1) || []
  }

  function isUserLeading(currUserId) {
    if (connectionMode === 'online-private') {
      let maxPoints = 0
      let leadingUser
      userInfo.forEach((userInfoObject) => {
        // If all first place users are tied, no one is leading
        if (userInfoObject.points === maxPoints) {
          leadingUser = null
        }
        if (userInfoObject.points > maxPoints) {
          maxPoints = userInfoObject.points
          leadingUser = userInfoObject.userId
        }
      })
      if (leadingUser === currUserId) {
        return true
      }
    }
    return false
  }

  return (
    <>
      {connectionMode === "offline" ? (
        <GameBoard
          board={board}
          activeRow={activeRow}
          activeCell={activeCell}
          username={username}
          connectionMode={connectionMode}
        />
      ) : (
        <div className="boards-container">
          {userInfo.length > 0 && (
            <GameBoard
              key={userInfo[0].userId}
              board={board}
              activeRow={activeRow}
              activeCell={activeCell}
              username={userInfo[0].username}
              points={userInfo[0].points}
              streak={userInfo[0].streak}
              connectionMode={connectionMode}
              isLeading={isUserLeading(userInfo[0].userId)}
            />
          )}
          {otherUserInfo().map((obj) => (
            <GameBoard
              key={obj.userId}
              board={obj.gameBoard}
              username={obj.username}
              points={obj.points}
              streak={obj.streak}
              connectionMode={connectionMode}
              isLeading={isUserLeading(obj.userId)}
            />
          ))}
        </div>
      )}
    </>
  )
}

export default GameBoardContainer
