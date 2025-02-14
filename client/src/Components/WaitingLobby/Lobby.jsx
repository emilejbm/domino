import React, { useState, useEffect, useRef } from "react";
import Paper from "../Shared/Paper/Paper";
import Avatar from "../Shared/Avatar/Avatar";
import Typography from "../Shared/Typography/Typography";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Button from "../Shared/Button/Button";
import WaitingTextAnimation from "./WaitingTextAnimation";
import styled from "styled-components";
import { useParams, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useSocket } from "../../socketContext";

const Span = styled.span`
  color: #f37006;
  text-shadow: 0 0 4px #f37006;
  font-weight: bold;
  font-size: larger;
`;
const Lobby = () => {

  const { gameCode } = useParams()
  const { socket, sendMessage, setContext } = useSocket();
  const [playerName, _] = useState(localStorage.getItem("playerName"))
  const [players, setPlayers] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const sendJoinGameMessage = () => {
    sendMessage({ type: "join-game", payload: {gameCode}});
  }

  const sendJoinLobbyMessage = () => {
    sendMessage({type: "join-lobby", payload: { playerName: playerName, lobbyCode: gameCode} })
  }
 
  useEffect(() => {
    let socketInstance = socket;
    if(!socketInstance) return;
    const handleLobbyMessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type){    
        case "players-in-lobby":
          setPlayers(message.payload);
          break;
        default:
          break;
      }
    }

    socketInstance.addEventListener("message", handleLobbyMessage)

    if (socketInstance.readyState === WebSocket.OPEN){
      sendJoinLobbyMessage();
    } else {
      socketInstance.addEventListener("open", sendJoinLobbyMessage)
    } 

    // cleanup
    return () => { 
        if (socketInstance) {
          socketInstance.removeEventListener("message", handleLobbyMessage);
          // sendMessage({ type: "leave-lobby", payload: {lobbyCode: gameCode} });
        }
    };
  }, [socket, gameCode, playerName, sendMessage, setContext, location]);

  useEffect(() => {
    setContext("lobby");
}, []);

  const handleStartGame = () => {
    sendJoinGameMessage() // tell the server player is going to start the game (player does not get deleted)
      navigate(`/game/${gameCode}`)
  };

  return (
    <Paper>
      <Grid container justifyContent="center" alignItems="center" spacing={2}>
        <Grid item xs={8}>
          <Typography>
            Waiting for Other Players To Join
            <WaitingTextAnimation />
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography>
            Joined ( <Span>{players.length}</Span>/4 )
          </Typography>
        </Grid>
        
        <Grid
          item
          container
          flexWrap="nowrap"
          alignItems="center"
          justifyContent="center"
          spacing={0.5}
          gap={6}
          xs={12}
        >
          {players.length > 0 && players.map((player) => {
            return (
              <Stack
                key={player}
                justifyContent="center"
                alignItems="center"
                spacing={1}
              >
                {/* <Avatar seed={`${player.name}${player.img}`} /> */}
                <Typography>{player}</Typography>
              </Stack>
            );
          })}
        </Grid>
      </Grid>
      <Grid container justifyContent="center" alignItems="center" spacing={2}>
        <Button onClick={handleStartGame}>
        {players.length !== 4 && <Typography>Start (with Bots)</Typography>}
        {players.length === 4 && <Typography>Start Game</Typography>}
        </Button>
      </Grid>
    </Paper>
  );
};

export default Lobby;
