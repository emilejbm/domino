import styled from "styled-components";
import Image from "../Image/Image";
import { motion } from "framer-motion";

const Root = styled.div`
  --color: var(--${(props) => props.color});
  width: var(--domoWidth);
  height: var(--domoHeight);

  /* overflow: hidden; */
  padding-top: 0%;
  border-radius: calc(var(--domoWidth) / 10);

  box-shadow: ${(props) =>
    !props.disableShadow ? "0 0 10px #292727" : "none"
  };
  position: relative;
  transform-style: preserve-3d;
  cursor: "pointer";

  .front,
  .back {
    border-radius: calc(var(--domoWidth) / 6);
    background: ${(props) => props.highlight ? "white" : "whitesmoke" };
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
    font-family: sans-serif;
  }

  .back {
    transform: rotateY(180deg) translateZ(1px);
  }
`;

export default function Domino({
  facesVisible = false,
  left = "",
  right = "",
  sideView = false,
  highlight = false,
  needsRotation = true,
  animate = false,
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
    const backUpImgSrc = `/images/${dominoNumToString(left)}-${dominoNumToString(right)}.png`

    // check if left-right.png exists, if not right-left.png probably does
    if (facesVisible && left !== undefined && right !== undefined) {
      return (
        <Image src={`/images/${dominoNumToString(right)}-${dominoNumToString(left)}.png`} ratio={470 / 230} backUpImgSrc={backUpImgSrc}/>
      );
    }
  }

  return (
    <Root
      as={motion.div}
      disableShadow={false}
      color="white"
      className="noselect"
      whileHover={{ y: -40, transition: { duration: 0.3 } }}
      animate={{
        rotate: facesVisible && needsRotation ? 180 : 0, // add animate?
        y: 0,
      }}
      transition={{ duration: animate ? 0.4 : 0, ease: "easeInOut" }}
      selectable={true}
      sideView={sideView}
      facesVisible={facesVisible}
      needsRotation={needsRotation}
      highlight={highlight}
    >
      <div className="front">{getFrontContent()}</div>
      <div className="back"></div>
    </Root>
  );
}