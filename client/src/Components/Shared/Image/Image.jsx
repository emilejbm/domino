import styled from "styled-components";
import { useState} from "react";

const Root = styled.div`
  position: relative;
  
  width: 100%;
  height: 100%;

  img {
    pointer-events: none;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    object-fit: cover;
    cursor: inherit;
  }
`;

export default function Image({ src, ratio = 470 / 230, backUpImgSrc }) {
  const [imageError, setImageError] = useState(false);
  const handleImageError = () => {
    setImageError(true);
};
  return (
    <Root ratio={ratio}>
      { imageError ? (
        <img src={backUpImgSrc}/> 
      ) : (
        <img src={src} onError={handleImageError}/>
      )}
    </Root>
  );
}
