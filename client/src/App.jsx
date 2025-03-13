import GameAudio from "./utils/audio";
import styled from "styled-components";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import StartPage from "./Components/StartPage/StartPage.jsx";
import Lobby from "./Components/Lobby/Lobby.jsx";
import CreateUser from "./Components/CreateUser/CreateUser.jsx";
import Loading from "./Components/Shared/Loading/Loading.jsx";
import MainMenu from "./Components/MainMenu/MainMenu.jsx";
import Game from "./Components/Game/Game"
import JoinLobby from "./Components/Lobby/JoinLobby.jsx";

const RootDiv = styled.div`
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
  background: radial-gradient(rgb(145, 230, 156),rgb(24, 57, 21));
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
          <Route path="/join-lobby" element={<JoinLobby />}/>
          <Route path="/lobby/:gameCode" element={<Lobby />}/>
          <Route path="/game/:gameCode" element={<Game />} />
        </Routes>
      </BrowserRouter>
    </RootDiv>
  )
}

export default App;
