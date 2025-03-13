import { useState, useEffect } from 'react';
import {
  Grid2 as Grid,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CenteredPaper, StyledAvatar, AlertContainer, StyledTextField } from "../Shared/StyledComponents.jsx"

const backend = "http://localhost:8080"

const JoinLobby = () => {
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '')
  const [avatarSeed, setAvatarSeed] = useState(localStorage.getItem('avatarSeed'))
  const [showAlert, setShowAlert] = useState(false);
  const [alertObj, setAlertObj] = useState({severity: 'info', msg: 'Lobby does not exist'});
  const navigate = useNavigate();

  useEffect(() => {
    setAvatarSeed(localStorage.getItem('avatarSeed') || playerName);
  }, [playerName]);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => setShowAlert(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const handleJoinGame = async () => {
    try {
      const lobbyExistsResponse = await fetch(`${backend}/lobby/${gameCode}`);
      if (lobbyExistsResponse.ok) {
        navigate(`/lobby/${gameCode}`)
      } else {
        setShowAlert(true);
        setAlertObj({severity: 'info', msg: 'Lobby does not exist'});
      }
    } catch (error) {
      console.log(error);
      setShowAlert(true);
      setAlertObj({severity: 'error', msg: 'Error fetching lobby'});
    }
  };

  return (
    <>
    {showAlert && 
    <AlertContainer><Alert severity={alertObj.severity}>{alertObj.msg}</Alert></AlertContainer>}
    <CenteredPaper elevation={10}>
      <Grid container direction="column" alignItems="center" spacing={3}>
        <Grid item>
          <StyledAvatar src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${avatarSeed}`} alt="Player Avatar" />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">Join Game</Typography>
        </Grid>
        <Grid item xs={10}>
          <StyledTextField
            variant="outlined"
            label="Game Code"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value)}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            sx={{ backgroundColor: 'rgb(148, 111, 7)', '&:hover': { backgroundColor: 'rgb(84, 62, 2)' } }}
            onClick={handleJoinGame}
            disabled={!gameCode.trim()}
          >
            Join Game
          </Button>
        </Grid>
      </Grid>
    </CenteredPaper>
    </>
  );
};

export default JoinLobby;