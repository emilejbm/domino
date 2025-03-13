import {
  Grid2 as Grid,
  Typography,
} from '@mui/material';
import { useState } from "react";
import { useNavigate, useParams, Link as RouterLink} from "react-router-dom";
import { CenteredPaper, StyledButton, StyledLink, StyledAvatar } from "../Shared/StyledComponents";

const serverUrl = "http://localhost:8080"

const MainMenu = () => {
  const navigate = useNavigate();
  const params = useParams()

  const [playerName, _] = useState(localStorage.getItem("playerName") || '');
  const [avatarSeed, setAvatarSeed] = useState(localStorage.getItem('avatarSeed') || playerName)

  const [isCreatingGame, setIsCreatingGame] = useState(false);

  const handleCreateGame = async () => {
    setIsCreatingGame(true);
    try {
      const response = await fetch(`${serverUrl}/create-lobby`, { method: 'GET' });
      if (response.ok) {
        const { gameCode } = await response.json();
        navigate(`/lobby/${gameCode}`);
      } else {
        alert('Error creating game');
      }
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Error creating game');
    }
    setIsCreatingGame(false);
  };

  const handleJoinGame = async () => {
    navigate(`/join-lobby`);
    // const response = await fetch("/join-game", {
    //   method: "POST", 
    //   body: JSON.stringify({ gameCode: params.gameCode, newPlayer: playerName }),
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // })
    // if (response.ok) {
    //   navigate(`/lobby/${params.gameCode}`)
    // } else {
    //   console.error("sum happened")    
    // }
  }

  return (
      <CenteredPaper key="main-menu" elevation={10}>
        <Grid container direction="column" alignItems="center" spacing={4}>
          <Grid item xs={12}>
            <Typography variant="h5">Start Playing</Typography>
          </Grid>
          <Grid item container direction="row" justifyContent="center" alignItems="center" spacing={2}>
            <Grid item xs="auto" md={5}>
              <StyledButton
                variant="contained"
                sx={{ backgroundColor: 'rgb(148, 111, 7)', '&:hover': { backgroundColor: 'rgb(84, 62, 2)' } }}
                onClick={handleCreateGame}
                disabled={isCreatingGame}
              >
                <img src="assets/icons/add.svg" alt="" />
                <Typography>Create A Game</Typography>
              </StyledButton>
            </Grid>
            <Grid item sx={{ display: { xs: 'none', md: 'block' } }} md={2}>
              <Typography>OR</Typography>
            </Grid>
            <Grid item xs="auto" md={5}>
              <StyledButton
                variant="contained"
                sx={{ backgroundColor: 'rgb(148, 111, 7)', '&:hover': { backgroundColor: 'rgb(84, 62, 2)' } }}
                onClick={handleJoinGame}
              >
                <img src="assets/icons/glob.svg" alt="" />
                <Typography>Join A Game</Typography>
              </StyledButton>
            </Grid>
          </Grid>
          <Grid teim xs={12}>
          <StyledAvatar src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${avatarSeed}`}/>
          </Grid>
          <Grid item xs={12}>
            <StyledLink component={RouterLink} to="/create-user">
              Profile Settings
            </StyledLink>
          </Grid>
        </Grid>
      </CenteredPaper>
    );
};

export default MainMenu;
