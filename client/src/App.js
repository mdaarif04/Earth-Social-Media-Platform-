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
import io from "socket.io-client";
import SocketClient from "./SocketClient";
import { getNotifies } from "./redux/actions/notifyAction";
import CallModal from "./components/message/CallModal";
import Peer from "peerjs";
import EmailVerification from "./pages/EmailVerification";
import EmailSend from "./pages/PSChange/EmailSend";
import EmailVerify from "./pages/PSChange/EmailVerify";

function App() {
  const { auth, status, modal, call } = useSelector((state) => state);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(refreshToken());
    const socket = io();
    dispatch({ type: GLOBALTYPES.SOCKET, payload: socket });
    return () => socket.close();
  }, [dispatch]);

  useEffect(() => {
    if (auth.token) {
      dispatch(getPosts(auth.token));
      dispatch(getSuggestions(auth.token));
      dispatch(getNotifies(auth.token));
    }
  }, [dispatch, auth.token]);

  useEffect(() => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
        }
      });
    }
  }, []);

  useEffect(() => {
    const newPeer = new Peer(undefined, {
      path: "/",
      secure: true,
    });
    dispatch({ type: GLOBALTYPES.PEER, payload: newPeer });
  }, [dispatch]);

  return (
    <>
      <BrowserRouter>
        <Alert />
        <input type="checkbox" id="theme" />
        <div className={`App ${(status || modal) && "mode"}`}>
          <div className="main">
            {auth.token && <Header />}
            {status && <StatusModal />}
            {auth.token && <SocketClient />}
            {call && <CallModal />}

            <main className="wrap_page">
              <Routes>
                <Route
                  exact
                  path="/"
                  element={
                    !auth.token ? (
                      <Login />
                    ) : !auth.user?.isVerified ? (
                      <EmailVerification />
                    ) : (
                      <Home />
                    )
                  }
                />
                <Route exact path="/register" Component={Register} />
                <Route exact path="/verify" Component={EmailVerification} />
                <Route exact path="/emailsend" Component={EmailSend} />
                <Route exact path="/emailverify" Component={EmailVerify} />
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
