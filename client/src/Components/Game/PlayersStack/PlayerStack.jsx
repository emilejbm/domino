import styled from "styled-components";
import { useState, useEffect } from "react"
import { motion } from "framer-motion";
import Domino from "../../Shared/Domino/Domino";

const DOMINO_WIDTH = 3;
const DOMINO_HEIGHT = DOMINO_WIDTH * (470 / 230)

const PlayerStackStyle = styled.div`
  position: fixed;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
`;

const Row = styled.div`
  display: flex;
  justify-content: center;

  filter: ${(props) =>
    props.highlight ? "drop-shadow(0 0 10px white)" : "brightness(0.9)"};

  --domoWidth: 5vw;
  --domoHeight: calc(var(--domoWidth) * (470 / 230));
  --dominoesLength: ${(props) => props.dominoesLength};
  --containerMaxWidth: 50vw;
  .domo-container {
    &:not(:last-of-type) {
      margin-right: calc(
        -1 * max(calc((
                  var(--domoWidth) * var(--dominoesLength) - var(--containerMaxWidth)
                ) / (var(--dominoesLength)-1)), calc(var(--domoWidth) / 3))
      );
    }
  }
`;

const DropIndicator = styled.div`
  --domoWidth: 5vw;
  --domoHeight: calc(var(--domoWidth) * (470 / 230));
  position: absolute;
  width: var(--domoWidth);
  height: var(--domoHeight);
  background: rgba(221, 231, 255, 0.88);
  border: 2px dashed white;
  left: calc(50% + ${(props) => props.xpos}vw);
  top: calc(50% + ${(props) => props.ypos}vh);
  transform: translate(-50%, -50%);
  z-index: 3;
`;


const getNextLocationOnLeft = (lastDomoCoords) => {
  if (!lastDomoCoords) return { x: 0, y: 0 };
  
  const leftEdge = window.innerWidth * 0.05;
  const bottomEdge = window.innerHeight * 0.9;

  let x; let y;

  // try to go left, down, and then right
  if (lastDomoCoords.left - DOMINO_WIDTH > leftEdge) {
    x = lastDomoCoords.left - (DOMINO_WIDTH);
    y = lastDomoCoords.top;
  } else if (lastDomoCoords.left - DOMINO_WIDTH < leftEdge ) {
    x = lastDomoCoords.left;
    y = lastDomoCoords.bottom;
  } else if (lastDomoCoords.bottom - DOMINO_WIDTH > bottomEdge ) {
    x = lastDomoCoords.right;
    y = lastDomoCoords.bottom + DOMINO_HEIGHT;
  }

  return {x, y}
}

const getNextLocationOnRight = (lastDomoCoords) => {
  if (!lastDomoCoords) return { x: 0, y: 0 };
  
  const rightEdge = window.innerWidth * 0.95;
  const topEdge = window.innerHeight * 0.1;

  let x; let y;

  // try to go right, up, and then left
  if (lastDomoCoords.right + DOMINO_WIDTH < rightEdge) {
    x = lastDomoCoords.right + (DOMINO_WIDTH);
    y = lastDomoCoords.top;
  } else if (lastDomoCoords.right + DOMINO_WIDTH > rightEdge ) {
    x = lastDomoCoords.right - DOMINO_HEIGHT;
    y = lastDomoCoords.top + DOMINO_HEIGHT;
  } else if (lastDomoCoords.top + DOMINO_WIDTH > topEdge ) {
    x = lastDomoCoords.left - DOMINO_WIDTH;
    y = lastDomoCoords.top;
  }

  return {x, y}
}

export default function PlayerStack({ dominoes, isMyTurn, dominoCoords, makeMove, gameBoard }) {
  const [hoveredDomino, setHoveredDomino] = useState(null);
  const [selectedDomino, setSelectedDomino] = useState(null);
  const [validPlacementLocations, setValidPlacementLocations] = useState([]);

  useEffect(() => {
      if (hoveredDomino == null) {
        setValidPlacementLocations([]);
        return;
      }
      
      if (!gameBoard || !dominoCoords) {
          setValidPlacementLocations([{ x: 0, y: 0 }]);
          return;
      }
      const coordsArray = Object.values(dominoCoords);

      const leftmostLocation = coordsArray[0];
      const rightmostLocation = coordsArray[coordsArray.length - 1];

      const leftmostDomino = gameBoard[0];
      const rightmostDomino = gameBoard[gameBoard.length - 1];

      let validLocations = [];

      if ((hoveredDomino.LeftSide === leftmostDomino.LeftSide) || (hoveredDomino.LeftSide === leftmostDomino.RightSide) || 
          (hoveredDomino.RightSide === leftmostDomino.LeftSide) || hoveredDomino.RightSide === leftmostDomino.RightSide) {
          validLocations.push(getNextLocationOnLeft(leftmostLocation));
      }
      if ((hoveredDomino.LeftSide === rightmostDomino.LeftSide) || (hoveredDomino.LeftSide === rightmostDomino.RightSide) || 
          (hoveredDomino.RightSide === rightmostDomino.LeftSide) || hoveredDomino.RightSide === rightmostDomino.RightSide) {
          validLocations.push(getNextLocationOnRight(rightmostLocation));
      }
      
      //setValidPlacementLocations(validLocations);
      setValidPlacementLocations([{ x: 0, y: 0 }]);

  }, [hoveredDomino, dominoCoords, gameBoard]);

  return (
    <>
      <PlayerStackStyle>
          {dominoes !== null && (
              <Row layout dominoesLength={dominoes.length} highlight={isMyTurn}>
                  {dominoes.map((domino, index) => (
                      <motion.div
                          key={index}
                          drag
                          dragElastic={0.4}
                          // dragConstraints={{ top: , bottom: 0, left: -300, right: 300 }} 
                          dragTransition={{ bounceDamping: 10, bounceStiffness: 100 }}
                          onHoverStart={() => {
                            setHoveredDomino(domino);
                          }}
                          onHoverEnd={() => {
                            setHoveredDomino(null);
                          }}
                          onDoubleClick={() => {
                            setSelectedDomino(domino);
                            makeMove(domino, "Left");
                          }}
                          onDragStart={() => {
                              setSelectedDomino(domino);
                          }}
                          onDragEnd={(event) => {
                              if (selectedDomino !== null && validPlacementLocations.length > 0) {
                                  const midpoint = window.innerWidth / 2;
                                  const mouseX = event.clientX;
                                  if (mouseX < midpoint){
                                    makeMove(selectedDomino, "Left");
                                  } else {
                                    makeMove(selectedDomino, "Right");
                                  }    
                              }
                              setSelectedDomino(null);
                          }}
                          animate={hoveredDomino === null ? { x: 0, y: 0 } : {}} // return pos after dragging
                      >
                          <div className="domo-container">
                              <Domino
                                onGameBoard={false}
                                facesVisible={true}
                                left={domino.LeftSide}
                                right={domino.RightSide}
                                sideView={false}
                                selectable={true}
                              />
                          </div>
                      </motion.div>
                  ))}
              </Row>
          )}
      </PlayerStackStyle>
      {/* {hoveredDomino &&
        validPlacementLocations.map((location, idx) => (
            <DropIndicator key={idx} xpos={location.x} ypos={location.y} />
        ))} */}
      </>
  );
}