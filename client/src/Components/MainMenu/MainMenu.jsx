import React from "react";

import Grid from "@mui/material/Grid2";
import Paper from "../Shared/Paper/Paper";
import Button from "../Shared/Button/Button";
import Typography from "../Shared/Typography/Typography";
import { useState } from "react";
import { Link, useNavigate, useParams} from "react-router-dom";
// import API from "../../api/API";
import { useDispatch } from "../../utils/hooks.ts";
import { setInLobby, setPlayerId } from "../../stores/redux/gameSlice";

const style = {
  color: "#fff",
};

const serverUrl = "http://localhost:8080"

const MainMenu = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams()

  const [playerName, _] = useState(localStorage.getItem("playerName"));
  const [isCreatingGame, setIsCreatingGame] = useState(false);

  // Function to handle creating a game
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
    const response = await fetch("/join-game", {
      method: "POST", 
      body: JSON.stringify({ gameCode: params.gameCode, newPlayer: playerName }),
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (response.ok) {
      navigate(`/lobby/${params.gameCode}`)
    } else {
      console.error("sum happened")    
    }
  }

  // const onPlayOnline = () => {
  //   API.playOnline(true);
  // };

  // const onPlayOffline = async () => {
  //   API.playOnline(false);
  //   const playerId = await API.joinServer();
  //   dispatch(setPlayerId(playerId));
  //   dispatch(setInLobby(true));
  //   navigate("/waiting-lobby");
  // };

  return (
    <Paper key="main-menu">
      <Grid container direction="column" alignItems="center" justifyContent="center" spacing={4}>
        <Grid item xs={10}>
          <Typography fontSize={22}>Start Playing</Typography>
        </Grid>
        <Grid
          item
          container
          alignItems="center"
          justifyContent="center"
          spacing={2}
          sx={12}
        >
          <Grid item xs={12} md={5}>
            <Button
              style={{ width: "80%" }}
              onClick={handleCreateGame}
              disabled={isCreatingGame}
            >
              <img src="assets/icons/add.svg" alt="" />
              <Typography>Create A Game</Typography>
            </Button>
          </Grid>
          <Grid item sx={{ display: { xs: "none", md: "initial" } }} md={2}>
            <Typography>OR</Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <Button
             // disabled={!API.isOnline}
              style={{ width: "80%" }}
              onClick={handleJoinGame}
            >
              <img src="assets/icons/glob.svg" alt="" />
              <Typography>Join A Game</Typography>
            </Button>
          </Grid>
        </Grid>
        <Grid item container alignItems="center" justifyContent="center" mt={6}>
          <Grid item xs={6}>
            <Link style={style} to="/create-user">
              Profile Settings
            </Link>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MainMenu;
