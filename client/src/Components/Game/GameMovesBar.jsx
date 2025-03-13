import React, { useState } from 'react';
import { Box, Typography, Avatar, styled, Paper } from '@mui/material';

const MovesListContainer = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  top: theme.spacing(2),
  right: theme.spacing(2),
  width: 300,
  maxHeight: 400,
  overflowY: 'auto',
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

const moves = [
    {
      playerName: "player1",
      avatar: '/static/images/avatar/5.jpg',
      played: "5,4"
    },
]
export default function MovesList(){
  return (
    <MovesListContainer elevation={3}>
      <Typography variant="h6" gutterBottom>
        Moves
      </Typography>
      {moves.map((move, index) => (
        <MoveItem key={index}>
          <MoveAvatar alt={move.playerName} src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${move.playerName}`} />
          <Box>
            <Typography variant="subtitle2">{move.name}</Typography>
            <Typography variant="body2">{move.played}</Typography>
          </Box>
        </MoveItem>
      ))}
    </MovesListContainer>
  );
};
