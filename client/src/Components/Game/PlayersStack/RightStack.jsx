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

  --cardHeight: calc(1.41 * var(--cardWidth));
  --dominoesLeft: ${(props) => props.dominoesLeft};
  --containerMaxHeight: 50vh;
  .card-container {
    &:not(:last-of-type) {
      margin-bottom: calc(
        -1 * max(calc((
                  var(--cardHeight) * var(--dominoesLeft) -
                    var(--containerMaxHeight)
                ) / (var(--dominoesLeft)-1)), calc(var(--cardHeight) / 2))
      );
    }
  }
`;

export default function RightStack({dominoesLeft, highlight}) {
  const dominoesToRender = [];

  for (let i = 0; i < dominoesLeft; i++) {
    dominoesToRender.push(
      <div className="card-container" key={i}>
        <Domino
          left={null}
          right={null}
          width={200} // prob should be dynamic
        />
      </div>
    );
  }

  return (
    <RightStackStyle>
      <Column layout dominoesLeft={dominoesLeft} highlight={highlight}>
        {dominoesToRender}
      </Column>
    </RightStackStyle>
  );
}
