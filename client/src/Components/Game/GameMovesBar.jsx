import { Box, Typography, Avatar, styled, Paper } from '@mui/material';

const MovesListContainer = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  top: theme.spacing(2),
  right: theme.spacing(2),
  width: '15vw',
  maxHeight: '10vh',
  overflowY: 'auto',
  overflowX: 'auto',
  padding: theme.spacing(2),
  zIndex: 1000,
}));

const MoveItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

const MoveAvatar = styled(Avatar)(({ theme }) => ({
  width: 30,
  height: 30,
  marginRight: theme.spacing(1),
}));

export default function MovesList({ movesSoFar, players, startingMove }){
  return (
    <MovesListContainer elevation={3}>
      <Typography variant="h6" gutterBottom>
        Moves
      </Typography>
      {movesSoFar.map((move, index) => {
        const playerName = players[(startingMove.playerIdx+index)%4]
        return (
        <MoveItem key={index}>
          <MoveAvatar src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${playerName}`} />
          <Box>
            {move && <Typography variant="body2">{`${playerName}: ${move.LeftSide},${move.RightSide}`}</Typography>}
            {move == null && <Typography variant="body2">{`${playerName}: pass`}</Typography>}
          </Box>
        </MoveItem>
        )
      })}
    </MovesListContainer>
  );
};
