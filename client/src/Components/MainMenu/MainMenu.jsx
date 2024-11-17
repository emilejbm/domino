import React from "react";
import Grid from "@mui/material/Grid2";
import Paper from "../Shared/Paper/Paper";
import Button from "../Shared/Button/Button";
import Typography from "../Shared/Typography/Typography";
import { Link, useNavigate } from "react-router-dom";
// import API from "../../api/API";
import { useDispatch } from "../../utils/hooks.ts";
import { setInLobby, setPlayerId } from "../../stores/redux/gameSlice";

import { useSocket } from '../../SocketProvider';

const style = {
  color: "#fff",
};

const MainMenu = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = useSocket();
  function handleCreateGame() {
    dispatch()
    socket.emit("") // only cal the socket emits from the dispatch functions
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
              href="/create-game"
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
              href="/join-server"
             // onClick={onPlayOnline}
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
