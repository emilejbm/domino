import PlayerStack from "./PlayersStack/PlayerStack.jsx";
import LeftStack from "./PlayersStack/LeftStack.jsx";
import RightStack from "./PlayersStack/RightStack.jsx";
import TopStack from "./PlayersStack/TopStack.jsx";
import GameBoard from "./GameBoard.jsx"
import GameEndModal from "./Scoreboard/EndGameModal.jsx"
import { useState, useEffect, useMemo } from "react"
import { useParams, useLocation } from "react-router-dom";
import { useSocket } from "../../socketContext.jsx";
import GameMovesBar from "./GameMovesBar.jsx"
import { Alert } from "@mui/material";
import { AlertContainer } from "../Shared/StyledComponents.jsx";

const DOMINO_WIDTH = 3;
const DOMINO_HEIGHT = DOMINO_WIDTH * (470 / 230);

export default function Game() {

  const { gameCode } = useParams()
  const { socket, sendMessage, setContext } = useSocket();

  // player state
  const [dominoes, setDominoes] = useState([]); // send once: check
  const [playerName, _] = useState(localStorage.getItem("playerName")); // send once
  const [myTurn, setMyTurn] = useState(0); // send once, or conditional: check

  // game state
  const [startingMove, setStartingMove] = useState(null); // send every time: check
  const [players, setPlayers] = useState([]); // send once: check
  const [gameBoard, setGameBoard] = useState(null); // []Dominoes type {LeftSide: int, RightSide: int} // send every time: check
  const [movesSoFar, setMovesSoFar] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(null); // sent every time: check
  const [playerThatJustPassed, setPlayerThatJustPassed] = useState(null); // conditional: check
  const [showPlayerPassed, setShowPlayerPassed] = useState(false); // conditional: check
  const [dominoesLeft, setDominoesLeft] = useState([7,7,7,7]); // sent every time: check
  const [gameEndStats, setGameEndStats] = useState({})

  // calculated
  const [dominoCoords, setDominoCoords] = useState({}); // calculated 
  const [gameState, setGameState] = useState("not-started"); // currently calculated, send conditional
  
  const location = useLocation();

  useEffect(() => {
    sendStartGameMessage()
  }, [])

  useEffect(() => {
    if (playerThatJustPassed != null) {
      setShowPlayerPassed(true);
    }
    setTimeout(() => {
      setPlayerThatJustPassed(null);
      setShowPlayerPassed(false);
    }, 4000)
  }, [playerThatJustPassed])

  const sendJoinGameMessage = () => {
    sendMessage({type: "join-game", payload: {gameCode} })
  }

  const sendStartGameMessage = () => {
    sendMessage({type: "start-game", payload: {gameCode} })
  }

  const makeMove = (domino, side) => {
    sendMessage({type: "game-action", payload: { domino, side }, })
  }

  const playAgainHandler = () => {
    sendMessage({type: "play-again"})
    return;
  }

  useEffect(() => {
    let socketInstance = socket;
    if(!socketInstance) return;
    const handleGameMessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type){
        case "game-info":
          setGameState("in-progress")
          setPlayers(message.payload.playerNames);
          setDominoes(message.payload.hand);
          setMyTurn(message.payload.myTurn);
          break;

        case "updated-game-board":
          setDominoesLeft(message.payload.dominoesLeft);
          setCurrentTurn(message.payload.currentTurn);
          setGameBoard(message.payload.gameBoard);
          setDominoes(message.payload.hand);
          setStartingMove(message.payload.startingMove);
          setMovesSoFar(message.payload.movesSoFar);
          break;

        case "game-ended":
          console.log("game-ended received", message.payload);
          setGameState("game-ended");
          setGameEndStats(message.payload)
          break;

        case "someone-passed":
          setPlayerThatJustPassed(message.payload)
          break;

        default:
          break;
      }
    }
    socketInstance.addEventListener("message", handleGameMessage)
    
    if (socketInstance.readyState === WebSocket.OPEN){
      sendJoinGameMessage();
    } else {
      socketInstance.addEventListener("open", sendJoinGameMessage)
    } 

    // cleanup
    return () => { 
        if (socketInstance) {
          socketInstance.removeEventListener("message", handleGameMessage);
          // check this
          // sendMessage({ type: "leave-game", payload: {gameCode} });
        }
    };
  }, [socket, gameCode, playerName, sendMessage, setContext, location]);

  return (
    <>
    {gameState === "not-started" && 
    <></>
    }
    {gameState === "in-progress" && 
    <div>
      <GameMovesBar movesSoFar={movesSoFar} players={players} startingMove={startingMove} />
      <PlayerStack dominoes={dominoes} isMyTurn={currentTurn === myTurn} dominoCoords={dominoCoords} makeMove={makeMove} gameBoard={gameBoard}/>
      <RightStack dominoesLeft={dominoesLeft[(myTurn + 1)%4]} highlight={currentTurn === ((myTurn + 1)%4)} />
      <TopStack dominoesLeft={dominoesLeft[(myTurn + 2)%4]} highlight={currentTurn === ((myTurn + 2)%4)} />
      <LeftStack dominoesLeft={dominoesLeft[(myTurn + 3)%4]} highlight={currentTurn === ((myTurn + 3)%4)} />
      <GameBoard gameBoard={gameBoard} dominoCoords={dominoCoords} startingMove={startingMove} setDominoCoords={setDominoCoords}/>
      {showPlayerPassed && <AlertContainer><Alert open={showPlayerPassed} severity="warning">{playerThatJustPassed} has passed</Alert></AlertContainer>}
    </div>
    }
    {gameState === "game-ended" && 
      <GameEndModal open={true} players={players} gameEndStats={gameEndStats} playAgain={playAgainHandler}/>
    }
    </>
  );
}