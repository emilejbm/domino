import { useState } from 'react';
import {
  Grid2 as Grid,
  Button,
  TextField,
  Typography,
  styled,
  Paper,
  Avatar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CenteredPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 500,
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  textAlign: 'center',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(2),
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  marginBottom: theme.spacing(2),
}));

const JoinLobby = () => {
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '')
  const [avatarSeed, setAvatarSeed] = useState(localStorage.getItem('avatarSeed') || playerName)
  const navigate = useNavigate();

  const handleJoinGame = () => {
    console.log(`Joining game with code: ${gameCode}`);
    navigate('/waiting-lobby');
  };

  return (
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
  );
};

export default JoinLobby;