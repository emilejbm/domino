import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { canPlayCard } from "../../BotsServer/BotsServer";
import { wrapMod } from "../../utils/helpers";
import { Card, Player } from "../../utils/interfaces";
import GenerateDominoList from "../../utils/DominoHelpers"


interface StoreState {
  playerId: string;
  players: Player[];
  currentPlayer: number;
  nextPlayer: number;
  inGame: boolean;
  inLobby: boolean;
}

const initialState = {
  inGame: false,
} as StoreState;

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    initGame: (state, action: PayloadAction<{ players: Player[] }>) => {
      console.log('called for init reducer action')
      const dominos = GenerateDominoList()
      
    },
    setPlayerId(state, action: PayloadAction<string>) {
      state.playerId = action.payload;
    },
    makeMove: (state, action: PayloadAction<any>) => {
      console.log("called make move")
    },
    restartGame: (state, action: PayloadAction<any>) => {
      console.log("called restart game")
    },

    createGame: (state, action: PayloadAction<any>) => {

      // count how many players there are
      // fill w bots
      // send player list to server
      // wait for backend 
      console.log("called restart game")
      console.log("This is state: ", state)
      console.log("This is payload action: ", action)
    }
  },
});

export const {
  initGame,
  setPlayerId,
  makeMove, 
  restartGame
} = gameSlice.actions;

export default gameSlice.reducer;
