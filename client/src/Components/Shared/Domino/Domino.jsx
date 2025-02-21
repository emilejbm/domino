import styled from "styled-components";
import Image from "../Image/Image";
import { motion } from "framer-motion";
// import API from "../../../api/API";

const Root = styled.div`
  --color: var(--${(props) => props.color});

  /* overflow: hidden; */
  padding-top: 141%;
  border-radius: calc(var(--cardWidth) / 10);

  box-shadow: ${(props) =>
    !props.disableShadow ? "0 0 10px #292727" : "none"};
  position: relative;
  transform-style: preserve-3d;

  cursor: ${(props) => (props.playable ? "pointer" : "inherit")};
  filter: ${(props) =>
    props.selectable && !props.playable ? "contrast(.5)" : "none"};

  .front,
  .back {
    border-radius: calc(var(--cardWidth) / 10);
    background: whitesmoke;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    backface-visibility: hidden;
  }

  .front {
    transform: translateZ(1px);
    font-family: sans-serif;

    .value {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: var(--color);
      font-size: var(--fontBig);
      font-family: sans-serif !important;
      font-weight: bold;
      text-shadow: 5px 5px black;
      -webkit-text-stroke: black 2px;
    }

    .card-icon {
      width: 80%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .value-small {
      position: absolute;
      color: white;
      -webkit-text-stroke: black 1.5px;
      font-weight: bold;
      font-size: var(--fontSmall);
      font-style: italic;
      font-family: sans-serif !important;

      &.value-tl {
        top: 14px;
        left: 22px;
      }

      &.value-br {
        bottom: 14px;
        right: 22px;
        transform: scale(-1);
      }

      @media screen and (max-width: 1000px) {
        -webkit-text-stroke: black 1px;

        .value {
          text-shadow: 3px 3px black;
        }

        &.value-tl {
          top: 9px;
          left: 13px;
        }

        &.value-br {
          bottom: 9px;
          right: 13px;
          transform: scale(-1);
        }
      }
    }

    .icon-small {
      position: absolute;
      width: 20%;
      &.icon-tl {
        top: 25px;
        left: 20px;
      }

      &.icon-br {
        bottom: 25px;
        right: 20px;
        transform: scale(-1);
      }
      @media screen and (max-width: 1000px) {
        &.icon-tl {
          top: 14px;
          left: 11px;
        }

        &.icon-br {
          bottom: 14px;
          right: 11px;
          transform: scale(-1);
        }
      }
    }
  }

  .back {
    transform: rotateY(180deg);
  }
`;

export default function Domino({
  id = "",
  left = "",
  right = "",
  disableShadow = true,
  playable,
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

  const getFrontContent = () => {
    if (left === null || right === null) {
      return (<></>)
    }
    return (
      <>
        <Image src={`/images/${dominoNumToString(left)}-${dominoNumToString(right)}.png`} ratio={590 / 418} />
      </>
    );
  };

  return (
    <Root
      as={motion.div}
      color="black"
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
      animate={{ rotateY: 180, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      selectable={true}
      playable={true}
      disableShadow={false}
      //onClick={onClick}
    >
      <div className="back">{getFrontContent()}</div>
      <div className="front"> 
         <Image src={`assets/images/backside.png`} ratio={590 / 418} />
      </div>
    </Root>
  );
}
