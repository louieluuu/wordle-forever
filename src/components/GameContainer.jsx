import { useState, useEffect } from "react"

// Components
import GameBoard from './GameBoard'
import Keyboard from './Keyboard'
import AlertModal from './AlertModal'
import LobbyInfo from './LobbyInfo'

// Data
import VALID_WORDS from "../data/validWords"
import WORDLE_ANSWERS from "../data/wordleAnswers"

function GameContainer({
    gameMode,
    connectionMode,
}) {

    // Gameflow states
    const [isGameWon, setIsGameWon] = useState(false)
    const [isOutOfGuesses, setIsOutOfGuesses] = useState(false)

    // Gameplay states
    const [board, setBoard] = useState(new Array(6).fill().map((_) => new Array(5).fill({ letter: "", color: "" })))
    const [activeRowIndex, setActiveRowIndex] = useState(0)
    const [activeCellIndex, setActiveCellIndex] = useState(0)
    const [submittedGuesses, setSubmittedGuesses] = useState([])
    const [hints, setHints] = useState({ green: new Set(), yellow: new Set(), grey: new Set() })

    // Alert states
    const [alertMessage, setAlertMessage] = useState(".")
    const [showAlertModal, setShowAlertModal] = useState(false)

    // Solution
    const [solution, setSolution] = useState("")

    // useEffect hooks

    // Run once when the component mounts
    useEffect(() => {
        startNewGame()
    }, [])

    // Some race condition happening here where the first run is happening before solution gets updated
    useEffect(() => {
        if (gameMode === 'Challenge' && solution !== "") {
            generateRandomFirstGuess(solution)
        }
    }, [solution])

    // Helper functions

    function startNewGame() {
        resetStates()

        const newSolution = generateSolution()
        setSolution(newSolution)

        console.log("Starting game with", gameMode, connectionMode)
    }

    function resetStates() {
        setIsGameWon(false)
        setIsOutOfGuesses(false)
        setBoard(new Array(6).fill().map((_) => new Array(5).fill({ letter: "", color: "" })))
        setActiveRowIndex(0)
        setActiveCellIndex(0)
        setSubmittedGuesses([])
        setHints({ green: new Set(), yellow: new Set(), grey: new Set() })
        setShowAlertModal(false)
    }

    function handleKeyPress(e) {
        if (e.match(/^[a-zA-Z]$/)) {
            handleLetter(e)
        } else if (e === 'Backspace') {
            handleBackspace()
        } else if (e === 'Enter') {
            handleEnter()
        }
    }

    function handleLetter(e) {
        if (activeRowIndex < board.length) {
            const updatedBoard = board.map((row, rowIndex) => {
                if (rowIndex === activeRowIndex) {
                    return row.map((cell, cellIndex) => {
                        if (cellIndex === activeCellIndex && board[activeRowIndex][activeCellIndex].letter === '') {
                            return { ...cell, letter: e.toUpperCase() }
                        } else {
                            return cell
                        }
                    });
                } else {
                    return row
                }
            });

            if (activeCellIndex === updatedBoard[activeRowIndex].length) {
                return
            }
            
            setBoard(updatedBoard)
            setActiveCellIndex(activeCellIndex + 1)
        }
    }

    function handleBackspace() {
        const updatedBoard = [...board]
        if (activeCellIndex === updatedBoard[activeRowIndex].length - 1 && updatedBoard[activeRowIndex][activeCellIndex].letter !== '') {
            updatedBoard[activeRowIndex][activeCellIndex] = { ...updatedBoard[activeRowIndex][activeCellIndex], letter: '' }
            setBoard(updatedBoard)
        }
        else if (activeCellIndex > 0) {
            updatedBoard[activeRowIndex][activeCellIndex - 1] = { ...updatedBoard[activeRowIndex][activeCellIndex - 1], letter: '' }
            setActiveCellIndex(activeCellIndex - 1)
            setBoard(updatedBoard)
        }
    }

    function handleEnter() {
        const enteredWord = board[activeRowIndex]
        .filter(cell => cell.letter !== '')
        .map(cell => cell.letter)
        .join('')
        .toUpperCase()

        if (validateUserGuess(enteredWord)) {
            setUserGuess(enteredWord, solution)
        }
    }

    function generateSolution() {
        const newSolution = WORDLE_ANSWERS[Math.floor(Math.random() * WORDLE_ANSWERS.length)].toUpperCase()
        console.log("solution is", newSolution)
        return newSolution
    }

    function validateUserGuess(guess) {
        if (guess.length < 5) {
            setAlertMessage("Not enough letters")
            setShowAlertModal(true)
            return false
        } else if (!VALID_WORDS.includes(guess.toLowerCase())) {
            setAlertMessage("Not in word list")
            setShowAlertModal(true)
            return false
        } else if ((gameMode === 'Hard' || gameMode === 'Challenge') && !usesPreviousHints(guess).isValid) {
            if (usesPreviousHints(guess).failCondition.color === "green") {
                const index = usesPreviousHints(guess).failCondition.index
                const letter = usesPreviousHints(guess).failCondition.letter
                setAlertMessage(`The ${index}${getSuffix(index)} letter must be ${letter}`)
                setShowAlertModal(true)
                return false
            } else {
                const letter = usesPreviousHints(guess).failCondition.letter
                setAlertMessage(`'${letter}' must be included in the solution`)
                setShowAlertModal(true)
                return false
            }
        }

        return true
    }

    function setUserGuess(guess) {
        if (guess === solution) {
            setIsGameWon(true)
        } else {
            setSubmittedGuesses([...submittedGuesses, activeRowIndex])
            const nextRow = activeRowIndex + 1
            setActiveRowIndex(nextRow)
            setActiveCellIndex(0)
            if (nextRow >= board.length) {
                setIsOutOfGuesses(true)
            }
        }

        const colorizedGuess = assignColors(guess)
        const updatedBoard = board.map(row => [...row])
        updatedBoard[activeRowIndex] = colorizedGuess
        setBoard(updatedBoard)

        updateHints(colorizedGuess)
    }

    function assignColors(guess) {
        let colorizedGuess = new Array(5).fill({ letter: "", color: "" })
        let solutionArray = [...solution]

        // Assign greens (correct letter in correct spot)
        for (let i = 0; i < guess.length; i++) {
            const letter = guess[i]
            if (letter === solution[i]) {
                colorizedGuess[i] = { letter: letter, color: "green" }
                solutionArray[i] = null
            }
        }

        // Assign yellows (correct letter in wrong spot)
        for (let i = 0; i < guess.length; i++) {
            const letter = guess[i]
            // Don't overwrite already assigned greens
            if (colorizedGuess[i].color !== "green") {
                let includedIndex = solutionArray.indexOf(letter)
                if (includedIndex !== -1) {
                    colorizedGuess[i] = { letter: letter, color: "yellow" }
                    solutionArray[includedIndex] = null
                }
            }
        }

        // Assign greys (letter not in solution)
        colorizedGuess.forEach((cell, cellIndex) => {
            if (!cell.color) {
                colorizedGuess[cellIndex] = { letter: guess[cellIndex], color: "grey" }
            }
        })

        return colorizedGuess
    }

    // Used to color the keyboard tiles + for hard / challenge mode
    function updateHints(colorizedGuess) {
        const updatedGreenHints = new Set(hints.green)
        const updatedYellowHints = new Set(hints.yellow)
        const updatedGreyHints = new Set(hints.grey)

        colorizedGuess.forEach((cell) => {
            if (cell.color === "green") {
                updatedGreenHints.add(cell.letter)
            } else if (cell.color === "yellow") {
                updatedYellowHints.add(cell.letter)
            } else if (cell.color === "grey") {
                updatedGreyHints.add(cell.letter)
            }
        })

        const newHints = { green: updatedGreenHints, yellow: updatedYellowHints, grey: updatedGreyHints }
        setHints(newHints)
    }

    // Used for hard / challenge mode
    function usesPreviousHints(currentGuess) {
        let result = {
        isValid: true,
        failCondition: null,
        }

        // Base case
        if (activeRowIndex === 0) {
            return result
        }

        let currentGuessArray = [...currentGuess]
        let previousGuessCopy = [...board[activeRowIndex - 1]]
        
        for (let i = 0; i < previousGuessCopy.length; i++) {
            if (previousGuessCopy[i].color === "green") {
                if (currentGuessArray[i] !== previousGuessCopy[i].letter) {
                result.isValid = false
                result.failCondition = {
                    color: "green",
                    letter: previousGuessCopy[i].letter,
                    index: i+1,
                }
                return result
                }
                currentGuessArray[i] = ""
            }
        }

        for (let i = 0; i < previousGuessCopy.length; i++) {
            if (previousGuessCopy[i].color === "yellow") {
                let includedIndex = currentGuessArray.indexOf(previousGuessCopy[i].letter)
                if (includedIndex === -1) {
                result.isValid = false
                result.failCondition = {
                    color: "yellow",
                    letter: previousGuessCopy[i].letter,
                }
                return result
                }
                currentGuessArray[includedIndex] = null
            }
        }

        return result
    }

    // Used for challenge mode, generates a random starting word that always has exactly one letter in the correct spot
    function generateRandomFirstGuess(solution) {
        let randomFirstGuess
        while (true) {
            randomFirstGuess = VALID_WORDS[Math.floor(Math.random() * VALID_WORDS.length)].toUpperCase()
            let numGreenLetters = 0
            for (let i = 0; i < randomFirstGuess.length; i++) {
                if (randomFirstGuess[i] === solution[i]) {
                numGreenLetters += 1
                }
            }
            if (numGreenLetters === 1) {
                setUserGuess(randomFirstGuess)
                return randomFirstGuess
            }
        }
    }

    // Could be generalized but no need for this game since the solution will always be 5 letters
    function getSuffix(number) {
        switch (number) {
        case 1:
            return "st"
        case 2:
            return "nd"
        case 3:
            return "rd"
        default:
            return "th"
        }
    }

  return (
    <div className="game-container">
      <LobbyInfo gameMode={gameMode} connectionMode={connectionMode} />
      <AlertModal
        showAlertModal={showAlertModal}
        setShowAlertModal={setShowAlertModal}
        message={alertMessage}
      />
      {isGameWon ? (
        <div className="win-message">
          <h2>Congratulations! You guessed the word!</h2>
          <button onClick={startNewGame}>Play Again</button>
        </div>
      ) : null}
      {isOutOfGuesses ? (
        <div className="loss-message">
          <h2>Truly unfortunate. Maybe next time bud.</h2>
          <button onClick={startNewGame}>Play Again</button>
        </div>
      ) : null}
      <GameBoard board={board} />
      <Keyboard handleKeyPress={handleKeyPress} hints={hints} />
    </div>
  );
}

export default GameContainer