import PlayerStack from "./PlayersStack/PlayerStack.jsx";
import LeftStack from "./PlayersStack/LeftStack.jsx";
import RightStack from "./PlayersStack/RightStack.jsx";
import TopStack from "./PlayersStack/TopStack.jsx";
import GameBoard from "./GameBoard.jsx"
import GameEndModal from "./Scoreboard/EndGameModal.jsx"
import { useState, useEffect } from "react"
import { useParams, useLocation } from "react-router-dom";
import { useSocket } from "../../socketContext.jsx";
import GameMovesBar from "./GameMovesBar.jsx"

export default function Game() {

  const { gameCode } = useParams()
  const { socket, sendMessage, setContext } = useSocket();
  const [firstDomino, setFirstDomino] = useState(null);
  const [dominoes, setDominoes] = useState([]); // type {LeftSide: int, RightSide: int}
  const [players, setPlayers] = useState([]);
  const [playerName, _] = useState(localStorage.getItem("playerName"))
  const [gameState, setGameState] = useState("not-started")
  const [currentTurn, setCurrentTurn] = useState(null)
  const [myTurn, setMyTurn] = useState(0)
  const [playerThatJustPassed, setPlayerThatJustPassed] = useState(null)
  const [dominoesLeft, setDominoesLeft] = useState([7,7,7,7]) // respective to players' turn (idx)
  const [gameBoard, setGameBoard] = useState(null) // []Dominoes type {LeftSide: int, RightSide: int}
  const [dominoCoords, setDominoCoords] = useState({});
  const location = useLocation();

  useEffect(() => {
    sendStartGameMessage()
  }, [])

  const sendJoinGameMessage = () => {
    sendMessage({type: "join-game", payload: {gameCode} })
  }

  const sendStartGameMessage = () => {
    sendMessage({type: "start-game", payload: {gameCode} })
  }

  const makeMove = (domino, side) => {
    sendMessage({type: "game-action", payload: { domino, side }, })
  }

  useEffect(() => {
    let socketInstance = socket;
    if(!socketInstance) return;
    const handleGameMessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type){    
        case "game-info":
          setPlayers(message.payload.playerNames);
          setDominoes(message.payload.hand)
          break;

        case "updated-game-board":
          setGameState("in-progress")
          setDominoesLeft(message.payload.dominoesLeft)
          setCurrentTurn(message.payload.turn)
          setGameBoard(message.payload.gameBoard)
          setDominoes(message.payload.hand)
          if (firstDomino === null){
            setFirstDomino(message.payload.gameBoard[0])
          }
          break;

        case "game-ended":
          console.log("game-ended received");
          setGameState("game-ended");
          break;

        case "someone-passed":
          console.log('someone just passed', message.payload);
          setPlayerThatJustPassed(message.payload)
          break;

        default:
          break;
      }
    }
    socketInstance.addEventListener("message", handleGameMessage)
    
    if (socketInstance.readyState === WebSocket.OPEN){
      sendJoinGameMessage();
    } else {
      socketInstance.addEventListener("open", sendJoinGameMessage)
    } 

    // cleanup
    return () => { 
        if (socketInstance) {
          socketInstance.removeEventListener("message", handleGameMessage);
          // check this
          // sendMessage({ type: "leave-game", payload: {gameCode} });
        }
    };
  }, [socket, gameCode, playerName, sendMessage, setContext, location]);

  return (
    <>
    {gameState === "not-started" && 
    <></>
    }
    {gameState === "in-progress" && 
    <div>
      <GameMovesBar/>
      <PlayerStack dominoes={dominoes} isMyTurn={currentTurn === myTurn} dominoCoords={dominoCoords} makeMove={makeMove} gameBoard={gameBoard}/>
      <RightStack dominoesLeft={dominoesLeft[(myTurn + 1)%4]} highlight={currentTurn === ((myTurn + 1)%4)} />
      <TopStack dominoesLeft={dominoesLeft[(myTurn + 2)%4]} highlight={currentTurn === ((myTurn + 2)%4)} />
      <LeftStack dominoesLeft={dominoesLeft[(myTurn + 3)%4]} highlight={currentTurn === ((myTurn + 3)%4)} />
      <GameBoard gameBoard={gameBoard} firstDomino={firstDomino} dominoCoords={dominoCoords} setDominoCoords={setDominoCoords}/>
    </div>
    }
    {gameState === "game-ended" && 
      <GameEndModal open={true}/>
    }
    </>
  );
}
