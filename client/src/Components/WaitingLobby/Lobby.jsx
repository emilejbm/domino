import React, { useEffect, useCallback } from "react";
import Paper from "../Shared/Paper/Paper";
import Avatar from "../Shared/Avatar/Avatar";
import Typography from "../Shared/Typography/Typography";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Button from "../Shared/Button/Button";
import WaitingTextAnimation from "./WaitingTextAnimation";
import styled from "styled-components";
import { useDispatch, useSelector } from "../../utils/hooks";
import { init, setInLobby } from "../../stores/redux/gameSlice";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
// import API from "../../api/API";

const Span = styled.span`
  color: #f37006;
  text-shadow: 0 0 4px #f37006;
  font-weight: bold;
  font-size: larger;
`;

const Lobby = () => {
  const [players, setPlayers] = React.useState([]);

  // const inLobby = useSelector((state) => state.game.inLobby);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleStartGame = () => {
    // get players
    // socket.emit("joinGame", { name: username, id: generateUniqueId() });
    // comm to api
    navigate("/game")
  } 

  // if (location.pathname === "/waiting-lobby" && !inLobby)
  //   return <Navigate replace to="/main-menu" />;

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
          {players.map((player) => {
            return (
              <Stack
                key={player.id}
                justifyContent="center"
                alignItems="center"
                spacing={1}
              >
                <Avatar seed={`${player.name}${player.img}`} />
                <Typography>{player.name}</Typography>
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
