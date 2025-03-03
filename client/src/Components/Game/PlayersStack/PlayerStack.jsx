import styled from "styled-components";
import Domino from "../../Shared/Domino/Domino";

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

export default function PlayerStack({ dominoes, highlight }) {

  console.log("rendering player stack, domos: ", dominoes)
  return (
    <PlayerStackStyle>
      {dominoes !== null && 
      
      <Row layout dominoesLength={dominoes.length} highlight={highlight}>
      {dominoes.map((domino) => (
        <div className="domo-container">
          <Domino
            isPlayerStack={true}
            left={domino.SideA}
            right={domino.SideB}
            sideView={false}
            selectable={true}
          />
        </div>
      ))}
    </Row>
    }
    </PlayerStackStyle>
  )
}
