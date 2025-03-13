import { useState, useEffect } from "react";
import {
  Typography,
  Stack,
  Avatar,
  styled,
} from '@mui/material';
import Grid from "@mui/material/Grid2";
import WaitingTextAnimation from "./WaitingTextAnimation";
import { useParams, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useSocket } from "../../socketContext";
import AdminSettings from "./AdminSettings"
import { CenteredPaper, StyledButton, StyledAvatar } from "../Shared/StyledComponents";

const Lobby = () => {

  const { gameCode } = useParams()
  const { socket, sendMessage, setContext } = useSocket();
  const [playerName, setPlayerName] = useState(localStorage.getItem("playerName") || '');
  const [avatarSeed, setAvatarSeed] = useState(localStorage.getItem('avatarSeed'));
  const [players, setPlayers] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setAvatarSeed(localStorage.getItem('avatarSeed') || playerName);
  }, [playerName]);

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
    sendJoinGameMessage()
      navigate(`/game/${gameCode}`)
  };

  return (
    <CenteredPaper >
      <Grid container direction="column" spacing={2} alignItems="center">
        <Grid item>
          <Typography variant="h6">
            Waiting for Other Players To Join
            <WaitingTextAnimation />
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="subtitle1">
            Joined ({players.length}/4)
          </Typography>
        </Grid>

        <Grid item container justifyContent="center" spacing={2}>
          {players.map((player) => (
            <Grid item key={player}>
              <Stack alignItems="center" spacing={1}>
                <StyledAvatar
                  alt={player}
                  src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${avatarSeed}`}
                />
                <Typography variant="body2">{player}</Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Grid item>
          <StyledButton
            variant="contained"
            sx={{ backgroundColor: 'rgb(148, 111, 7)', '&:hover': { backgroundColor: 'rgb(84, 62, 2)' } }}
            onClick={handleStartGame}
          >
            {players.length !== 4 ? 'Start (with Bots)' : 'Start Game'}
          </StyledButton>
        </Grid>
      </Grid>
      {<AdminSettings isAdmin={true}/>}
    </CenteredPaper>
    
  );
};

export default Lobby;

