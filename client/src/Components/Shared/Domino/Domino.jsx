import styled from "styled-components";
import Image from "../Image/Image";
import { motion } from "framer-motion";
// import API from "../../../api/API";

const Root = styled.div`
  --color: var(--${(props) => props.color});

  transform: ${(props) => (props.sideView ? "perspective(800px) rotateY(80deg)" : "none")};
  transform: ${(props) => (props.onGameBoard ? `rotate(90deg) translateY(calc(var(--domoWidth) / -4))` : "none")};
  width: var(--domoWidth);
  height: var(--domoHeight);

  /* overflow: hidden; */
  padding-top: 0%;
  border-radius: calc(var(--domoWidth) / 10);

  box-shadow: ${(props) =>
    !props.disableShadow ? "0 0 10px #292727" : "none"};
  position: relative;
  transform-style: preserve-3d;

  cursor: ${(props) => (props.playable ? "pointer" : "inherit")};

  .front,
  .back {
    border-radius: calc(var(--domoWidth) / 6);
    background: whitesmoke;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    backface-visibility: hidden;
    object-fit: cover;
  }

  .front {
    transform: rotateY(0deg) translateZ(1px);
    z-index: 2;
    font-family: sans-serif;
  }

  .back {
    transform: rotateY(180deg) translateZ(1px);
  }
`;

export default function Domino({
  onGameBoard = false,
  isPlayerStack = false,
  left = "",
  right = "",
  sideView = false,
  selectable = false,
}) {

  const dominoNumToString = (num) => {
    if (num === 0) return "cero";
    if (num === 1) return "uno";
    if (num === 2) return "dos";
    if (num === 3) return "tres";
    if (num === 4) return "cuatro";
    if (num === 5) return "cinco";
    if (num === 6) return "seis";
  }

  const getBackContent = () => {
    return (
      <></>
      //<Image src={`/images/backside3.png`} ratio={229 / 469} backUpImgSrc={null}/>
    )
  }

  const getFrontContent = () => {
    const backUpImgSrc = `/images/${dominoNumToString(right)}-${dominoNumToString(left)}.png`

    if (isPlayerStack && left !== undefined && right !== undefined) {
      // check if left-right.png exists, if not right-left.png probably does
      return (
        <Image src={`/images/${dominoNumToString(left)}-${dominoNumToString(right)}.png`} ratio={470 / 230} backUpImgSrc={backUpImgSrc}/>
      );
    }
  }

  return (
    <Root
      as={motion.div}
      sideView={sideView}
      disableShadow={false}
      color="white"
      className="noselect"
      initial={{
        rotateY: true ? Math.abs(180 - 180) : 180,
        y: 0,
      }}
      whileHover={
        true
          ? { y: -40, transition: { duration: 0.3 } }
          : { y: 0, transition: { duration: 0.3 } }
      }
      animate={{ rotateY: isPlayerStack ? 0 : 180, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      selectable={true}
      playable={true}
      onGameBoard={onGameBoard}
    >
      <div className="front">{getFrontContent()}</div>
      <div className="back">{getBackContent()}</div>
    </Root>
  );
}
