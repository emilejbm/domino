import {
  Modal,
  Box,
  Typography,
} from '@mui/material';
import { TeamRow, TeamMembers, TeamMember, StyledAvatar, StyledButton } from '../../Shared/StyledComponents';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  textAlign: 'center',
};

function TeamDisplay({ team, points }) {
    return (
        <TeamRow>
            <Box flex="1">
                {/* {teamName && <Typography variant="subtitle1">{teamName}</Typography>} */}
                <TeamMembers>
                    {team.map((player) => (
                        <TeamMember key={player}>
                            <StyledAvatar>
                              <img src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${player}`} />
                            </StyledAvatar>
                            <Typography>{player}</Typography>
                        </TeamMember>
                    ))}
                </TeamMembers>
            </Box>
            <Box textAlign="center">
                <Typography variant="h5">Points: {points}</Typography>
            </Box>
        </TeamRow>
    );
}

export default function GameEndModal({ open, players, gameEndStats, playAgain }) {
  const { winningTeam, pointsSoFar, roundPoints } = gameEndStats;
  console.log("game end modal info", winningTeam, pointsSoFar, roundPoints)
  return (
    <Modal
      open={open}
      //onClose={onClose}
      aria-labelledby="game-end-modal-title"
      aria-describedby="game-end-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography id="game-end-modal-title" variant="h6" component="h2">
          Game Ended
        </Typography>
        <Typography id="game-end-modal-description" sx={{ mt: 2 }}>
          { (winningTeam == 0 ? `${players[0]} & ${players[2]}` : `${players[1]} & ${players[3]}`) + " won "}
          { `${roundPoints} points`}
        </Typography>
        <br></br>

        {<TeamDisplay team={[players[0],players[2]]} points={pointsSoFar[0]}/>}
        {<TeamDisplay team={[players[1],players[3]]} points={pointsSoFar[1]}/>}

        <StyledButton variant="contained" onClick={playAgain}>
          Play Again
        </StyledButton>
      </Box>
    </Modal>
  );
}