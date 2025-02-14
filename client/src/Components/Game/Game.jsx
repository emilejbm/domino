import React from "react";
import Grid from "@mui/material/Grid2";
import Button from "../Shared/Button/Button";
import Typography from "../Shared/Typography/Typography";
import { AnimateSharedLayout } from "framer-motion";
import TableStack from "./TableStack/TableStack.jsx";
import PlayerStack from "./PlayerStack/PlayerStack.jsx";
import LeftStack from "./LeftStack/LeftStack.jsx";
import RightStack from "./RightStack/RightStack.jsx";
import TopStack from "./TopStack/TopStack.jsx";
import DrawingStack from "./DrawingStack/DrawingStack.jsx";
import Scoreboard from "./Scoreboard/Scoreboard.jsx"
import { useState, useEffect } from "react"
import { useParams, useLocation } from "react-router-dom";
import { useSocket } from "../../socketContext.jsx";


export default function Game() {

  const { gameCode } = useParams()
  const { socket, sendMessage, setContext } = useSocket();
  const [players, setPlayers] = useState([]);
  const [inLobby, setInLobby] = useState(true);
  const [playerName, _] = useState(localStorage.getItem("playerName"))
  const [gameState, setGameState] = useState("not-started")
  const location = useLocation();

  const sendJoinGameMessage = () => {
    sendMessage({type: "join-game", payload: { gameCode} })
  }

  const sendStartGameMessage = () => {
    sendMessage({type: "start-game", payload: { gameCode} })
  }

  useEffect(() => {
    let socketInstance = socket;
    if(!socketInstance) return;
    const handleGameMessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type){    
        case "player-names":
          console.log("payload", message.payload)
          setPlayers(message.payload);
          break;
        case "player-hand":
          console.log("this is the hand i got", message.payload)
          setGameState("ongoing")
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

  const handleStartGame = () => {
    sendStartGameMessage()
  }

  return (

    <>
    {gameState === "not-started" && <Grid item xs={12} md={5}>
            <Button
              style={{ width: "10%" }}
              onClick={handleStartGame}
              //disabled={isCreatingGame}
            >
              <img src="assets/icons/add.svg" alt="" />
              <Typography>Start</Typography>
            </Button>
          </Grid>}
    
    <div>
        {/* <TableStack />
        <TopStack />
        <LeftStack />
        <RightStack />
        <PlayerStack /> */}
        {/* <DrawingStack /> */}

      {gameState === "finished" && <Scoreboard players={players} />} 
    </div>
    </>
  );
}
