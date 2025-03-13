import { useEffect, useState } from 'react';
import {
  Grid2 as Grid,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ReChoiceIcon from './ReChoiceIcon';
import { CenteredPaper, StyledButton, StyledTextField, StyledAvatar, StyledIconButton } from "../Shared/StyledComponents";

const CreateUser = () => {

  const getLocalStorageName = () => {
    return localStorage.getItem('playerName') || '';
  };

  const [playerName, setPlayerName] = useState(getLocalStorageName);
  const [avatarSeed, setAvatarSeed] = useState(playerName);

  const handleUpdateAvatar = () => {
    setAvatarSeed((seed) => {
      let newSeed = seed + 1;
      localStorage.setItem('avatarSeed', newSeed)
      return seed + 1
    })
  }

  useEffect(() => {
    localStorage.setItem('playerName', playerName);
    localStorage.setItem('avatarSeed', avatarSeed);
  }, [playerName, avatarSeed]);

  return (
    <CenteredPaper elevation={10}>
      <Grid container direction="column" alignItems="center" spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6">Enter Your Name</Typography>
        </Grid>
        <Grid item xs={10} md={6}>
          <StyledTextField
            variant="outlined"
            label="Player Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        </Grid>

        <Grid item container justifyContent="center" alignItems="center" spacing={2} xs={10}>
          <Grid item>
            <StyledAvatar src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${avatarSeed}`} alt="Player Avatar" />
          </Grid>
          <Grid item>
            <StyledIconButton onClick={handleUpdateAvatar}>
              <ReChoiceIcon />
            </StyledIconButton>
          </Grid>
        </Grid>

        <Grid item xs={10}>
          {playerName && (
            <StyledButton
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/main-menu"
              disabled={!playerName.trim()}
              onClick={handleUpdateAvatar}
            >
              <Typography>Save & Go</Typography>
            </StyledButton>
          )}
        </Grid>
      </Grid>
    </CenteredPaper>
  );
};

export default CreateUser;