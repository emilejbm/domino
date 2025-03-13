import {
  Modal,
  Box,
  Typography,
  styled,
  Button,
  Avatar as MuiAvatar,
} from '@mui/material';

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

const StyledButton = styled(Button)(() => ({
    marginTop: '20px',
}))

const Cavatar = styled(MuiAvatar)(() => ({
    width: '50px',
    height: '50px',
    borderRadius: '50%',
}))

const Avatar = ({ seed }) => {
  return (
    <Cavatar>
      <img src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}`} alt={`${seed} avatar`} />
    </Cavatar>
  );
};

const TeamRow = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    border: '1px solid #ccc',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  }));
  
const TeamMembers = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
});

const TeamMember = styled(Box)({
    textAlign: 'center',
    width: '50%',
    padding: '8px',
});
  

function TeamDisplay({ team, points, teamName }) {
    return (
        <TeamRow>
            <Box flex="1">
                {teamName && <Typography variant="subtitle1">{teamName}</Typography>}
                <TeamMembers>
                    {team.map((player) => (
                        <TeamMember key={player.name}>
                            <Avatar seed={player.name} />
                            <Typography>{player.name}</Typography>
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

export default function GameEndModal({ open, onClose, winnerTeam, loserTeam, winnerPoints, loserPoints }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="game-end-modal-title"
      aria-describedby="game-end-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography id="game-end-modal-title" variant="h6" component="h2">
          Game Ended!
        </Typography>
        <Typography id="game-end-modal-description" sx={{ mt: 2 }}>
          {winnerTeam ? `Winners!` : 'It\'s a draw!'}
        </Typography>

        {winnerTeam && <TeamDisplay team={winnerTeam} points={winnerPoints} teamName={"Winning Team"}/>}
        {loserTeam && <TeamDisplay team={loserTeam} points={loserPoints} teamName={"Losing Team"}/>}

        <StyledButton variant="contained" onClick={onClose}>
          Play Again
        </StyledButton>
      </Box>
    </Modal>
  );
}