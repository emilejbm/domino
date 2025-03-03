import styled from "styled-components";
import Domino from "../Shared/Domino/Domino";
import { motion } from "framer-motion";
import { useRef } from "react";

const DOMINO_WIDTH = 3; // really more like length but css
const DOMINO_HEIGHT = DOMINO_WIDTH * (470 / 230) // avg png aspect ratio

// transform: ${(props) => (props.isDouble ? "rotate(90deg)" : "none")};

const GameBoardDiv = styled.div`
  position: absolute;
  z-index: 2;
  width: 90vw;
  height: 80vh;
  top: 50%;
  left: 50%;
  background: green;
  transform: translate(-50%, -50%);
  justify-content: center;
  display: flex;
  align-items:center;
  --domoWidth: ${(props) => props.dominoWidth}vw;
  --domoHeight: calc(var(--domoWidth) * (470 / 230));
`;

// get rid of transform for doubles for now
// need to rotate to match number
const DominoWrapper = styled.div`
  position: absolute;
  width: var(--dominoWidth);
  height: var(--dominoHeight);
  transform: ${(props) => (true ? `rotate(90deg) translateY(calc(var(--domoWidth) / -4))` : "none")};
  left: calc(50% + ${(props) => props.xPos}vw);
  top: calc(45% + ${(props) => props.yPos}vh);
`;

// x refers to left, y to top
// new leftmost domino means left of the first domino in an array where the first domino is always in the middle
const calcPositionForNewLeftmostDomino = (currIdx, coords, gameBoardRef) => {
    console.log("calculating left", currIdx, coords);
    const lastDominoOnLeftLocation = coords[`domino-${currIdx+1}`];
    // const gameBoardContainer = gameBoardRef.current.getBoundingClientRect();

    const leftEdge = window.innerWidth * 0.05;
    const bottomEdge = window.innerHeight * 0.9;

    let newX = lastDominoOnLeftLocation.left;
    let newY = lastDominoOnLeftLocation.top;

    // dominos will first go left, then down, then right. 

    // go left
    if (gameBoardContainer.left - DOMINO_WIDTH > leftEdge) {
        newX = lastDominoOnLeftLocation.left - (DOMINO_WIDTH);
        newY = lastDominoOnLeftLocation.top;
    }

    // if it reaches bottom edge, its bc we already went left, then down, so go right (assuming container had space to go down)
    if (lastDominoOnLeftLocation.bottom - DOMINO_WIDTH > bottomEdge ) {
        // change orientation
        newX = lastDominoOnLeftLocation.right;
        newY = lastDominoOnLeftLocation.bottom + DOMINO_HEIGHT;
    }

    // go down
    if (gameBoardContainer.left - DOMINO_WIDTH < leftEdge ) {
        // change orientation
        newX = lastDominoOnLeftLocation.left;
        newY = lastDominoOnLeftLocation.bottom;
    }

    return { newX, newY }
}

const calcPositionForNewRightmostDomino = (currIdx, coords, gameBoardRef) => {
    console.log("calc for right", currIdx, "wwwwwaaatt", coords);
    // const gameBoardContainer = gameBoardRef.current.getBoundingClientRect();
    const lastDominoOnRightLocation = coords[`domino-${currIdx-1}`];

    const rightEdge = window.innerWidth * 0.95;
    const topEdge = window.innerHeight * 0.1;

    // dominoes will first go right, then up, the left.

    let x = lastDominoOnRightLocation.left;
    let y = lastDominoOnRightLocation.top;

    // go right
    if (lastDominoOnRightLocation.right + DOMINO_WIDTH < rightEdge) {
        console.log("should go here")
        x = lastDominoOnRightLocation.right + DOMINO_WIDTH;
        y = lastDominoOnRightLocation.top;
    }

    // go left
    if (lastDominoOnRightLocation.top + DOMINO_WIDTH > topEdge) {
        // change orientation
        x = lastDominoOnRightLocation.left - DOMINO_WIDTH;
        y = lastDominoOnRightLocation.top;
    }

    // go up
    if (lastDominoOnRightLocation.right + DOMINO_WIDTH > rightEdge) {
        // change orientation
        x = lastDominoOnRightLocation.right - DOMINO_HEIGHT;
        y = lastDominoOnRightLocation.top + DOMINO_WIDTH;
    }

    return { x, y }

}

// not rotating of any kind (doubles or when changing direction)
const getNewDomoPosition = (isDouble, currIdx, midIndex, gameBoardLength, coords, gameBoardRef) => {
    if (currIdx === midIndex) {
        return { x: 0, y: 0 }
    }

    let newPos = {x: 0, y: 0}

    if (currIdx < midIndex) { // move left of middle domo
        newPos = calcPositionForNewLeftmostDomino(currIdx, coords, gameBoardRef);
    } else { // move right of middle domo
        newPos = calcPositionForNewRightmostDomino(currIdx, coords, gameBoardRef);
    }

    return newPos;
};

const renderDominoes = (gameBoard, firstDomino, gameBoardRef) => {
    let dominoesJsx = []
    let coords = {} // so that i can access supposed to be created dominoes
    const firstDomoIndex = gameBoard.findIndex((domo) => domo.SideA === firstDomino.SideA && domo.SideB === firstDomino.SideB );
    let idxOfLastDomoOnLeft = 0; // counter of how many dominoes have been rendered to the left of the middle one
    let idxOfLastDomoOnRight = 0;

    for (let i = 0; i < gameBoard.length; i++) {
        let domoToRenderIdx;
        if (i === 0) {
            domoToRenderIdx = firstDomoIndex;
        } else if (gameBoard[firstDomoIndex - idxOfLastDomoOnLeft - 1] !== undefined) {
            // render left
            idxOfLastDomoOnLeft -= 1;
            domoToRenderIdx = idxOfLastDomoOnLeft;
        } else if (gameBoard[firstDomoIndex + idxOfLastDomoOnRight + 1] !== undefined) {
            // render right
            idxOfLastDomoOnRight += 1;
            domoToRenderIdx = firstDomoIndex + idxOfLastDomoOnRight;
        }

        const domino = gameBoard[domoToRenderIdx]
        console.log("curridx", domoToRenderIdx, "first idx", firstDomoIndex )
        const { x, y } = getNewDomoPosition(true, domoToRenderIdx, firstDomoIndex, gameBoard.length, coords, gameBoardRef)
        coords[`domino-${domoToRenderIdx}`] = {left: x, top: y, right: x + DOMINO_WIDTH, bottom: y + DOMINO_HEIGHT}
        dominoesJsx.push(
            <DominoWrapper id={`domino-${domoToRenderIdx}`} as={motion.div} isDouble={true} xPos={x} yPos={y}>
                <Domino isPlayerStack={true} key={domoToRenderIdx} left={domino.SideA} right={domino.SideB} onGameBoard={true}/>
            </DominoWrapper>
        )
    }
    return dominoesJsx;
}

export default function GameBoard ({ gameBoard, firstDomino }) {
    console.log('gameboard', gameBoard, firstDomino)
    const gameBoardRef = useRef(null);
    return (
      <GameBoardDiv id={"gameBoardDiv"} ref={gameBoardRef} as={motion.div} dominoWidth={DOMINO_WIDTH}>
        {gameBoard && renderDominoes(gameBoard, firstDomino, gameBoardRef)}
      </GameBoardDiv>
    );
};

// styling
// some pictures not rendering (1)
// test correct steps taken to place dominos (adding width) to directions (1)
// doubles not being rotated (2)
// orientation change not being done (when changing direction)
// backside is ugly, fix proportions for player stack (2)
// make table less ugly (2)

// gameplay
// player make move (1)
// fix infinite bot passes
// show when game is ended
// show points + play again
