import styled from "styled-components";

const dominoes = [
    (1,2), (0, 1), (3, 5), (6,6), (0, 5)
]

const Root = styled.div`
  display: flex;
  justify-content: center;

  filter: ${(props) =>
    props.highlight ? "drop-shadow(0 0 10px white)" : "brightness(0.6)"};

  --cardsCnt: ${(props) => props.cardsCnt};
  --containerMaxWidth: 55vw;
  .card-container {
    &:not(:last-of-type) {
      margin-right: calc(
        -1 * max(calc((
                  var(--cardWidth) * var(--cardsCnt) - var(--containerMaxWidth)
                ) / (var(--cardsCnt)-1)), calc(var(--cardWidth) / 3))
      );
    }
  }
`;

export default function DominoRow(props) {
    return (
        <Root>

        </Root>
    )
}