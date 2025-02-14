import GameAudio from "./utils/audio";

import styled from "styled-components";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { store } from "./stores/store.ts"
import { useState } from "react";
import { Provider } from "react-redux"

import StartPage from "./Components/StartPage/StartPage";
import Lobby from "./Components/WaitingLobby/Lobby";
import CreateUser from "./Components/CreateUser/CreateUser";
import Loading from "./Components/Shared/Loading/Loading";
import MainMenu from "./Components/MainMenu/MainMenu";
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

  // const location = useLocation();

  const onLoaded = () => {
    GameAudio.playMusic("music");
    setLoadingAssets(false);
  };

  if (loadingAssets) return <Loading onLoaded={onLoaded} />;

  return (
    <RootDiv>
      <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/main-menu" element={<MainMenu />} />
          <Route path="/create-user" element={<CreateUser />}/>
          <Route path="/lobby/:gameCode" element={<Lobby />}/>
          <Route path="/mesa/:gameCode" element={<Game />} />
        </Routes>
      </BrowserRouter>
      </Provider>
    </RootDiv>
  )
}

export default App;
