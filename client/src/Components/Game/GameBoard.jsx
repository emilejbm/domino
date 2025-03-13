import styled from "styled-components";
import { useMemo } from "react";
import Domino from "../Shared/Domino/Domino";
import { motion } from "framer-motion";
import { useState, useEffect } from "react"

const DOMINO_WIDTH = 3; // really more like length but css
const DOMINO_HEIGHT = DOMINO_WIDTH * (470 / 230) // avg png aspect ratio

const GameBoardDiv = styled.div`
  position: absolute;
  z-index: 2;
  width: 90vw;
  height: 80vh;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  justify-content: center;
  display: flex;
  align-items:center;
  --domoWidth: ${(props) => props.dominoWidth}vw;
  --domoHeight: calc(var(--domoWidth) * (470 / 230));
`;

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
const calcPositionForNewLeftmostDomino = (currIdx, coords) => {
    const lastDominoOnLeftLocation = coords[`domino-${currIdx+1}`];

    const leftEdge = window.innerWidth * 0.05;
    const bottomEdge = window.innerHeight * 0.9;

    let x = lastDominoOnLeftLocation.left;
    let y = lastDominoOnLeftLocation.top;

    // dominos will first go left, then down, then right. 

    // go left
    if (lastDominoOnLeftLocation.left - DOMINO_WIDTH > leftEdge) {
        x = lastDominoOnLeftLocation.left - (DOMINO_WIDTH);
        y = lastDominoOnLeftLocation.top;
    }

    // if it reaches bottom edge, its bc we already went left, then down, so go right (assuming container had space to go down)
    if (lastDominoOnLeftLocation.bottom - DOMINO_WIDTH > bottomEdge ) {
        // change orientation
        x = lastDominoOnLeftLocation.right;
        y = lastDominoOnLeftLocation.bottom + DOMINO_HEIGHT;
    }

    // go down
    if (lastDominoOnLeftLocation.left - DOMINO_WIDTH < leftEdge ) {
        // change orientation
        x = lastDominoOnLeftLocation.left;
        y = lastDominoOnLeftLocation.bottom;
    }

    return { x, y }
}

const calcPositionForNewRightmostDomino = (currIdx, coords) => {
    const lastDominoOnRightLocation = coords[`domino-${currIdx-1}`];

    const rightEdge = window.innerWidth * 0.95;
    const topEdge = window.innerHeight * 0.1;

    // dominoes will first go right, then up, the left.

    let x = lastDominoOnRightLocation.left;
    let y = lastDominoOnRightLocation.top;

    // go right
    if (lastDominoOnRightLocation.right + DOMINO_WIDTH < rightEdge) {
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
const getNewDomoPosition = (isDouble, currIdx, midIndex, gameBoardLength, coords) => {
    if (currIdx === midIndex) {
        return { x: 0, y: 0 }
    }

    let newPos = {x: 0, y: 0}

    if (currIdx < midIndex) { // move left of middle domo
        newPos = calcPositionForNewLeftmostDomino(currIdx, coords);
    } else { // move right of middle domo
        newPos = calcPositionForNewRightmostDomino(currIdx, coords);
    }

    return newPos;
};

export default function GameBoard({ gameBoard, firstDomino, dominoCoords, setDominoCoords }) {

    const [lastHead, setLastHead] = useState(null);
    const [lastTail, setLastTail] = useState(null);
    useEffect(() => {
        if (gameBoard && gameBoard.length > 0) {
            if (!lastHead || lastHead.LeftSide !== gameBoard[0].LeftSide || lastHead.RightSide !== gameBoard[0].RightSide) {
                setLastHead(gameBoard[0]);
            }
            if (!lastTail || lastTail.LeftSide !== gameBoard[gameBoard.length - 1].LeftSide || lastTail.RightSide !== gameBoard[gameBoard.length - 1].RightSide) {
                setLastTail(gameBoard[gameBoard.length - 1]);
            }
        }
    }, [gameBoard]);


    useMemo(() => {
        if (!gameBoard || !firstDomino) {
            setDominoCoords({});
            return;
        }

        const newCoords = {};
        const firstDomoIndex = gameBoard.findIndex(
            (domo) => domo.LeftSide === firstDomino.LeftSide && domo.RightSide === firstDomino.RightSide
        );
        let idxOfLastDomoOnLeft = 0;
        let idxOfLastDomoOnRight = 0;

        for (let i = 0; i < gameBoard.length; i++) {
            let domoToRenderIdx;
            if (i === 0) {
                domoToRenderIdx = firstDomoIndex;
            } else if (gameBoard[firstDomoIndex - idxOfLastDomoOnLeft - 1] !== undefined) {
                idxOfLastDomoOnLeft -= 1;
                domoToRenderIdx = firstDomoIndex + idxOfLastDomoOnLeft;
            } else if (gameBoard[firstDomoIndex + idxOfLastDomoOnRight + 1] !== undefined) {
                idxOfLastDomoOnRight += 1;
                domoToRenderIdx = firstDomoIndex + idxOfLastDomoOnRight;
            }

            const { x, y } = getNewDomoPosition(true, domoToRenderIdx, firstDomoIndex, gameBoard.length, newCoords);
            newCoords[`domino-${domoToRenderIdx}`] = {
                left: x,
                top: y,
                right: x + DOMINO_WIDTH,
                bottom: y + DOMINO_HEIGHT,
            };
        }
        setDominoCoords(newCoords);
    }, [gameBoard, firstDomino, setDominoCoords]);

    const dominoesJsx = useMemo(() => {
        const checkIfNewDomino = (domino, index) => {
            if (index != 0 && index != (gameBoard.length - 1)){
                return false
            }
            if (domino.LeftSide == lastHead.LeftSide && domino.RightSide == lastHead.RightSide) {
                return false;
            }
            if (domino.LeftSide == lastTail.LeftSide && domino.RightSide == lastTail.RightSide) {
                return false;
            }

            return true;
        }
        const checkIfNeedsRotation = (domino, index) => {
            let prevDomo; let nextDomo;
            if (gameBoard[index-1]){
                prevDomo = gameBoard[index-1]
            }
            if(gameBoard[index+1]){
                nextDomo = gameBoard[index+1]
            }
            if (nextDomo && domino.RightSide == nextDomo.LeftSide && domino.RightSide > domino.LeftSide){
                return true
            }
            if (prevDomo && domino.LeftSide == prevDomo.RightSide && domino.RightSide > domino.LeftSide){
                return true
            }
            return false
        }

        if (!gameBoard) return null;
        if (!gameBoard || Object.keys(dominoCoords).length === 0) return null;

        return gameBoard.map((domino, index) => {
            const { left, top } = dominoCoords[`domino-${index}`];
            const needsRotation = checkIfNeedsRotation(domino, index);     
            const needsAnimation = checkIfNewDomino(domino, index);
            return (
                <DominoWrapper
                key={index}
                id={`domino-${index}`}
                as={motion.div}
                isDouble={true}
                xPos={left}
                yPos={top}
                >
                    <Domino
                    key={"left-"+domino.LeftSide+",right-"+domino.RightSide}
                    left={domino.LeftSide}
                    right={domino.RightSide}
                    facesVisible={true}
                    needsRotation={needsRotation}
                    animate={needsAnimation}
                    />
                </DominoWrapper>
            );
        });
    }, [gameBoard, dominoCoords]);

    return (
        <GameBoardDiv id={"gameBoardDiv"} as={motion.div} dominoWidth={DOMINO_WIDTH}>
            {dominoesJsx}
        </GameBoardDiv>
    );
}
