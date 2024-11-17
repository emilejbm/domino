import React from "react";
import { AnimateSharedLayout } from "framer-motion";
import TableStack from "./TableStack/TableStack.jsx";
import PlayerStack from "./PlayerStack/PlayerStack.jsx";
import { useState } from "react";
import LeftStack from "./LeftStack/LeftStack.jsx";
import RightStack from "./RightStack/RightStack.jsx";
import TopStack from "./TopStack/TopStack.jsx";
import DrawingStack from "./DrawingStack/DrawingStack.jsx";
import Scoreboard from "./Scoreboard/Scoreboard.jsx"
import { useDispatch } from "../../utils/hooks";

// import GameAudio from "../../utils/audio.js";

export default function Game() {
  const dispatch = useDispatch();
  const [finished, setFinished] = useState(false)

  // useEffect(() => {
  //   const timeoutReady = setTimeout(() => {
  //     API.emitReady()
  //   }, 2000)
  //   API.onMove(({ card, draw, cardsToDraw, nxtPlayer }) => {

  //     dispatch(
  //       moveCard({
  //         nextPlayer: nxtPlayer,
  //         card,
  //         draw,
  //         cardsToDraw,
  //       })
  //     );
  //     if (draw) {
  //       GameAudio.playAudio('draw', draw);
  //     } else GameAudio.playAudio('play')
  //     setTimeout(() => dispatch(movePlayer()), 500);
  //   })

  //   API.onFinishGame((players: Player[]) => {
  //     setFinished(true);
  //     setPlayersOrder(players);
  //   })

  //   return () => {
  //     API.leaveServer();
  //     dispatch(stopGame());
  //     clearTimeout(timeoutReady)
  //   }
  // }, [dispatch]);


  //if (!inGame) return <Navigate replace to="/main-menu" />;

  return (
    <div>
        {/* <TableStack /> */}
        <TopStack />
        <LeftStack />
        <RightStack />
        <PlayerStack />
        {/* <DrawingStack /> */}

      {finished && <Scoreboard players={[]} />} 
    </div>
  );
}
