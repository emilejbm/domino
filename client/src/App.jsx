import GameAudio from "./utils/audio";

import styled from "styled-components";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import StartPage from "./Components/StartPage/StartPage.jsx";
import Lobby from "./Components/WaitingLobby/Lobby.jsx";
import CreateUser from "./Components/CreateUser/CreateUser.jsx";
import Loading from "./Components/Shared/Loading/Loading.jsx";
import MainMenu from "./Components/MainMenu/MainMenu.jsx";
import CreateServer from "./Components/CreateServer/CreateGame.jsx";
import Game from "./Components/Game/Game"

const RootDiv = styled.div`
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
  /* background: radial-gradient(#5065da, #20295a); */
  background: radial-gradient(#3d50ba, #161d3f);
`;

// screen.lockOrientation("landscape");

function App() {
  const [loadingAssets, setLoadingAssets] = useState(false);

  const onLoaded = () => {
    GameAudio.playMusic("music");
    setLoadingAssets(false);
  };

  if (loadingAssets) return <Loading onLoaded={onLoaded} />;

  return (
    <RootDiv>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/main-menu" element={<MainMenu />} />
          <Route path="/create-user" element={<CreateUser />}/>
          <Route path="/lobby/:gameCode" element={<Lobby />}/>
          <Route path="/game/:gameCode" element={<Game />} />
        </Routes>
      </BrowserRouter>
    </RootDiv>
  )
}

export default App;
