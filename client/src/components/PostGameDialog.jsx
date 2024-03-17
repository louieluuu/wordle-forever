import React, { useRef } from "react"
import { sum, max } from "lodash-es"
const _ = { sum, max }

import socket from "../socket"

import { Dialog } from "@headlessui/react"

import { TfiClose } from "react-icons/tfi"
import { MdOutlineDoubleArrow } from "react-icons/md"

// TODO: please fix this complete abomination from top to bottom. god has abandoned us.

function PostGameDialog({
  setShowPostGameDialog,
  showScoreboard,
  setShowScoreboard,
  userInfoSortedByPoints,
  maxRounds,
}) {
  // Finding the "best" value for each stat. These values
  // will eventually be compared to each user's stats,
  // and bolded if they match.

  // const maxPoints = _.max(userInfoSortedByPoints.map((user) => user.points))
  // const maxRoundsWon = _.max(
  //   userInfoSortedByPoints.map((user) => user.roundsWon)
  // )
  // const maxSolves = _.max(
  //   userInfoSortedByPoints.map((user) => _.sum(user.solveDistribution))
  // )
  // const minTotalSolveTime = _.max(
  //   userInfoSortedByPoints.map((user) =>
  //     (user.totalSolveTime / _.sum(user.solveDistribution)).toFixed(2)
  //   )
  // )

  // console.log(`maxPoints: ${maxPoints}`)
  // console.log(`maxRoundsWon: ${maxRoundsWon}`)
  // console.log(`maxSolves: ${maxSolves}`)
  // console.log(`maxTotalSolveTime: ${minTotalSolveTime}`)

  // Inline styles
  const flexStart = {
    display: "flex",
    justifyContent: "flex-start",
  }

  const flexCenter = {
    display: "flex",
    justifyContent: "center",
  }

  const flexColumn = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  }

  // TODO: hanging variables?
  const closeButtonRef = useRef(null)

  function handleSetShowPostGameDialog() {
    setShowPostGameDialog(false)
    console.log("Hi1")
  }

  function switchPage() {
    setShowScoreboard((prevState) => !prevState)
    console.log("Hi2")
  }

  // This is running 500 times, not sure why.
  function isMatchingUserId(userId) {
    console.log("Hi3")
    return userId === socket.userId
  }

  return (
    <Dialog
      className="dialog--stats"
      open={true}
      onClose={handleSetShowPostGameDialog}
      initialFocus={closeButtonRef}
    >
      <Dialog.Panel>
        <div className="dialog__right">
          <div ref={closeButtonRef}>
            <TfiClose
              className="dialog__btn--close"
              onClick={handleSetShowPostGameDialog}
            />
          </div>
        </div>

        {showScoreboard ? (
          <div className="postgame__scoreboard">
            <Dialog.Title
              style={{
                fontFamily: "Calistoga",
                marginTop: "0.5rem",
                marginBottom: "0",
                display: "flex",
                justifyContent: "center",
              }}
            >
              Results
            </Dialog.Title>

            <hr style={{ marginBlock: "1.3rem" }} />

            {/* 1st place */}
            <div style={{ ...flexCenter, fontSize: "3rem" }}>👑</div>
            <div
              style={{
                ...flexCenter,
                fontSize: "2rem",
              }}
            >
              <b>1.&nbsp;</b>
              <span
                className={`postgame__user${
                  isMatchingUserId(userInfoSortedByPoints[0].userId)
                    ? "--highlight"
                    : ""
                }`}
              >
                {userInfoSortedByPoints[0].displayName}
              </span>
            </div>
            <div style={{ ...flexCenter, fontSize: "1.5rem", opacity: "70%" }}>
              {userInfoSortedByPoints[0].points} pts
            </div>

            <br></br>

            {/* 2nd and 3rd place */}
            <div
              style={{
                display: "flex",
                fontSize: "1.3rem",
                justifyContent: "space-around",
              }}
            >
              {/* 2nd place */}
              <div
                style={{
                  ...flexStart,
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <b>2.&nbsp;</b>
                <span
                  className={`postgame__user${
                    isMatchingUserId(userInfoSortedByPoints[1].userId)
                      ? "--highlight"
                      : ""
                  }`}
                >
                  {userInfoSortedByPoints[1].displayName}
                </span>

                <div style={{ opacity: "50%" }}>
                  {userInfoSortedByPoints[1].points} pts
                </div>
              </div>

              {userInfoSortedByPoints.length > 2 && (
                <>
                  {/* 3rd place */}
                  <div
                    style={{
                      ...flexStart,
                      flexDirection: "column",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <b>3.&nbsp;</b>
                    <span
                      className={`postgame__user${
                        isMatchingUserId(userInfoSortedByPoints[2].userId)
                          ? "--highlight"
                          : ""
                      }`}
                    >
                      {userInfoSortedByPoints[2].displayName}
                    </span>
                    <div style={{ opacity: "50%" }}>
                      {userInfoSortedByPoints[2].points} pts
                    </div>
                  </div>
                </>
              )}
            </div>

            <br></br>

            {/* 4th place and below */}
            {userInfoSortedByPoints.length > 3 && (
              <div style={flexColumn}>
                <br></br>
                {userInfoSortedByPoints.slice(3).map((user, userIndex) => (
                  <div key={user.userId}>
                    {`${userIndex + 4}.`}&nbsp;
                    <span
                      className={`postgame__user${
                        isMatchingUserId(
                          userInfoSortedByPoints[userIndex + 3].userId
                        )
                          ? "--highlight"
                          : ""
                      }`}
                    >
                      {user.displayName}
                    </span>
                    &nbsp;-&nbsp;
                    {user.points}
                  </div>
                ))}
                <br></br>
              </div>
            )}
            <hr style={{ marginBlock: "1.3rem" }} />
          </div>
        ) : (
          <>
            <Dialog.Title
              style={{
                fontFamily: "Calistoga",
                marginTop: "0.5rem",
                marginBottom: "0",
                display: "flex",
                justifyContent: "center",
              }}
            >
              Statistics
            </Dialog.Title>
            <hr style={{ marginBlock: "1.3rem" }} />
            <p
              style={{
                fontWeight: "bold",
                display: "flex",
                justifyContent: "center",
              }}
            ></p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
              className="scoreboard-users"
            >
              <div className="table-container">
                <table border="1" frame="void" rules="all">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Points</th>
                      <th>Won</th>
                      <th>Solved</th>
                      <th>Avg Guesses</th>
                      <th>Avg Solve Time</th>
                      {/* Add more headers for additional properties */}
                    </tr>
                  </thead>
                  <tbody>
                    {userInfoSortedByPoints.map((user) => (
                      <tr key={user.userId}>
                        <td
                          className={`postgame__user${
                            isMatchingUserId(user.userId) ? "--highlight" : ""
                          }`}
                        >
                          {user.displayName}
                        </td>
                        <td>{user.points}</td>
                        <td>{user.roundsWon}</td>
                        <td>{_.sum(user.solveDistribution)}</td>
                        <td>
                          {_.sum(user.solveDistribution) > 0
                            ? (
                                user.totalSolveTime /
                                _.sum(user.solveDistribution)
                              ).toFixed(2)
                            : "/"}
                        </td>
                        <td>
                          {user.totalGuesses > 0
                            ? (user.totalGuesses / maxRounds).toFixed(2)
                            : "/"}
                        </td>

                        {/* Add more cells for additional properties */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <hr style={{ marginBlock: "1.3rem" }} />
          </>
        )}

        <div style={{ ...flexCenter, fontSize: "2rem" }}>
          {showScoreboard ? (
            <MdOutlineDoubleArrow onClick={switchPage} />
          ) : (
            <MdOutlineDoubleArrow
              style={{ transform: "scaleX(-1)" }}
              onClick={switchPage}
            />
          )}
        </div>
      </Dialog.Panel>
    </Dialog>
  )
}

export default PostGameDialog
