import React from "react"

import { FaQuestionCircle } from "react-icons/fa"
import { Tooltip } from "react-tooltip"

// TODO Might as well put this in scss since the challenge color's already there...
const formStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontFamily: "Roboto Slab",
  paddingBottom: "0.5rem",
}

function ChallengeForm({ isFirstTimeVisitor, gameMode, setGameMode }) {
  function handleClick() {
    const target = gameMode === "normal" ? "challenge" : "normal"
    console.log(`Setting game mode to ${target}`)

    setGameMode(target)
    localStorage.setItem("gameMode", target)
  }

  return (
    <div style={formStyle}>
      <form className="challenge__label">
        <label htmlFor="activate_challenge_mode" className="challenge__label">
          <input
            id="activate_challenge_mode"
            type="checkbox"
            className="challenge__checkbox"
            checked={gameMode === "challenge"}
            onChange={handleClick}
          />
          &nbsp;Challenge Mo
        </label>
        de&nbsp;
        <a
          data-tooltip-id="challenge-tooltip"
          style={{ verticalAlign: "middle" }}
        >
          <FaQuestionCircle
            className="challenge__question-circle"
            color="hsl(0,0%,50%)"
          />
        </a>
        {!isFirstTimeVisitor && (
          <Tooltip id="challenge-tooltip" place="top">
            <ul className="challenge__tooltip--list">
              <li>For experienced Wordlers!</li>
              <li>Random starting word</li>
              <li>Must use previous hints</li>
            </ul>
          </Tooltip>
        )}
      </form>
    </div>
  )
}

export default ChallengeForm
