import React from "react";
import Grid from "@mui/material/Grid2";
import Button from "../Shared/Button/Button";
import Typography from "../Shared/Typography/Typography";
import { AnimateSharedLayout } from "framer-motion";
import PlayerStack from "./PlayersStack/PlayerStack.jsx";
import LeftStack from "./PlayersStack/LeftStack.jsx";
import RightStack from "./PlayersStack/RightStack.jsx";
import TopStack from "./PlayersStack/TopStack.jsx";
import Scoreboard from "./Scoreboard/Scoreboard.jsx"
import { useState, useEffect } from "react"
import { useParams, useLocation } from "react-router-dom";
import { useSocket } from "../../socketContext.jsx";


export default function Game() {

  const { gameCode } = useParams()
  const { socket, sendMessage, setContext } = useSocket();
  const [dominoes, setDominoes] = useState([]); // type {SideA: int, SideB: int}
  const [players, setPlayers] = useState([]);
  const [playerName, _] = useState(localStorage.getItem("playerName"))
  const [gameState, setGameState] = useState("not-started")
  const [currentTurn, setCurrentTurn] = useState(null)
  const [myTurn, setMyTurn] = useState(0)
  const [playerThatJustPassed, setPlayerThatJustPassed] = useState(null)
  const [dominoesLeft, setDominoesLeft] = useState([7,7,7,7]) // respective to players' turn (idx)
  const [gameBoard, setGameBoard] = useState(null) // []Dominoes type {SideA: int, SideB: int}
  const location = useLocation();

  console.log("Game state", gameState)

  const sendJoinGameMessage = () => {
    sendMessage({type: "join-game", payload: {gameCode} })
  }

  const sendStartGameMessage = () => {
    sendMessage({type: "start-game", payload: {gameCode} })
  }

  const handleStartGame = () => {
    sendStartGameMessage()
  }

  const makeMove = (domino) => {
    //sendMessage({type: "make-move", payload: { domino } })
  }

  const handleDragEnd = async (event, info) => {
    // not sure how to find domino
    //const domino = gameState.playerHands[gameState.currentPlayer].find(d => d.id === selectedDomino);
    //makeMove(domino)
  };

  useEffect(() => {
    let socketInstance = socket;
    if(!socketInstance) return;
    const handleGameMessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type){    
        case "game-info":
          console.log("payload for game-info", message.payload)
          setPlayers(message.payload.playerNames);
          setDominoes(message.payload.hand)
          break;
        case "updated-game-board":
          console.log("someone played", message.payload)
          setGameState("in-progress") // chekea si hay tranque
          setDominoesLeft(message.payload.dominoesLeft)
          setCurrentTurn(message.payload.turn)
          setGameBoard(message.payload.gameBoard)
          break;
        case "someone-passed":
          console.log("this player passed", message.payload.playerPassed)
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
      <Grid item xs={12} md={5}>
        <Button
          style={{ width: "10%" }}
          onClick={handleStartGame}
        >
          <img src="assets/icons/add.svg" alt="" />
          <Typography>Start</Typography>
        </Button>
      </Grid>
    }
    {gameState === "in-progress" && 
    <div>
        <PlayerStack dominoes={dominoes} highlight={currentTurn === myTurn}/>
        <RightStack dominoesLeft={dominoesLeft[(myTurn + 1)%4]} highlight={currentTurn === ((myTurn + 1)%4)} />
        <TopStack dominoesLeft={dominoesLeft[(myTurn + 2)%4]} highlight={currentTurn === ((myTurn + 2)%4)} />
        <LeftStack dominoesLeft={dominoesLeft[(myTurn + 3)%4]} highlight={currentTurn === ((myTurn + 3)%4)} />
    </div>
    }
    {gameState === "finished" && <Scoreboard players={players} />} 
    </>
  );
}
