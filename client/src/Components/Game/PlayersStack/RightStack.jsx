import styled from "styled-components";
import Domino from "../../Shared/Domino/Domino";

const RightStackStyle = styled.div`
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
`;

const Column = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  filter: ${(props) =>
    props.highlight ? "drop-shadow(0 0 10px white)" : "brightness(0.6)"};

  --domoWidth: 1.5vw;
  --domoHeight: calc(var(--domoWidth) * (470 / 230));
  --dominoesLeft: ${(props) => props.dominoesLeft};
  --containerMaxHeight: 50vh;
  .domo-container {
    &:not(:last-of-type) {
      margin-bottom: calc(
        -1 * max(calc((
                  var(--domoHeight) * var(--dominoesLeft) -
                    var(--containerMaxHeight)
                ) / (var(--dominoesLeft)-1)), calc(var(--domoHeight) / 2))
      );
    }
  }
`;

export default function RightStack({dominoesLeft, highlight}) {
  const dominoesToRender = [];

  for (let i = 0; i < dominoesLeft; i++) {
    dominoesToRender.push(
      <div className="domo-container" key={i}>
        <Domino
          left={null}
          right={null}
          sideView={true}
          highlight={highlight}
        />
      </div>
    );
  }

  return (
    <RightStackStyle>
      <Column side-view layout dominoesLeft={dominoesLeft} highlight={highlight}>
        {dominoesToRender}
      </Column>
    </RightStackStyle>
  );
}
