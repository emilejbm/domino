import styled from "styled-components";
import Domino from "../../Shared/Domino/Domino";

const TopStackStyle = styled.div`
  position: fixed;
  left: 50%;
  top: 0;
  transform: translate(-50%, -50%);
`;

const Row = styled.div`
  display: flex;
  justify-content: center;

  filter: ${(props) =>
    props.highlight ? "drop-shadow(0 0 10px white)" : "brightness(0.6)"};

  --domoWidth: 4vw;
  --domoHeight: calc(var(--domoWidth) * (469 / 229));;
  --dominoesLeft: ${(props) => props.dominoesLeft};
  --containerMaxWidth: 50vw;
  .domo-container {
    &:not(:last-of-type) {
      margin-right: calc(
        -1 * max(calc((
                  var(--domoWidth) * var(--dominoesLeft) - var(--containerMaxWidth)
                ) / (var(--dominoesLeft)-1)), calc(var(--domoWidth) / 3))
      );
    }
  }
`;

export default function TopStack({ dominoesLeft, highlight} ) {
  const dominoesToRender = [];

  for (let i = 0; i < dominoesLeft; i++) {
    dominoesToRender.push(
      <div className="domo-container" key={i}>
        <Domino
          left={null}
          right={null}
          sideView={false}
        />
      </div>
    );
  }

  return (
    <TopStackStyle>
      <Row layout dominoesLeft={dominoesLeft} highlight={highlight}>
        {dominoesToRender}
      </Row>
    </TopStackStyle>
  );
}
