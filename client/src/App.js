import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect } from "react";

import PageRender from "./CustomRouter/PageRender";

import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";

import PrivateRouter from "./CustomRouter/PrivateRouter";

import Alert from "./components/alert/Alert";
import Header from "./components/header/Header";

import { useDispatch, useSelector } from "react-redux";
import { refreshToken } from "./redux/actions/authAction";
import StatusModal from "./components/StatusModal";
import { getPosts } from "./redux/actions/postAction";
import { getSuggestions } from "./redux/actions/suggestionsAction";

import { GLOBALTYPES } from "./redux/actions/globalTypes";
import io from 'socket.io-client'
import SocketClient from './SocketClient'

function App() {
  const { auth, status, modal } = useSelector((state) => state)
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(refreshToken())
    const socket = io();
    dispatch({type: GLOBALTYPES.SOCKET, payload: socket})
    return () => socket.close()
  }, [dispatch]);

  useEffect(() => {
    if (auth.token) {
      dispatch(getPosts(auth.token))
      dispatch(getSuggestions(auth.token))
    }
  }, [dispatch, auth.token])


  return (
    <>
      <BrowserRouter>
        <Alert />
        <input type="checkbox" id="theme" />
        <div className={`App ${(status || modal) && 'mode'}`}>
          <div className="main">
            {auth.token && <Header />}
            {status && <StatusModal />}
            {auth.token && <SocketClient />}

            <main className="wrap_page">
              <Routes>
                <Route exact path="/" Component={auth.token ? Home : Login} />
                <Route exact path="/register" Component={Register} />
                <Route element={<PrivateRouter />}>
                  <Route path="/:page" Component={PageRender} />
                  <Route path="/:page/:id" Component={PageRender} />
                </Route>
              </Routes>
            </main>

          </div>
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
