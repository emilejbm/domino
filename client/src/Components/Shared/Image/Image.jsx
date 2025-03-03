import styled from "styled-components";

const Root = styled.div`
  position: relative;
  
  width: 100%;
  height: 100%;

  img {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    object-fit: cover;
    cursor: inherit;
  }
`;

export default function Image({ src, alt = " ", ratio = 9 / 16, backUpImgSrc, ...props }) {
  
  return (
    <Root ratio={ratio} {...props}>
      <img src={src} alt={alt} onerror={(e) => {
        e.target.onError = null;
        e.target.src = backUpImgSrc;
      }}/>
    </Root>
  );
}
