import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { POST_TYPES } from "./redux/actions/postAction";
import { GLOBALTYPES } from "./redux/actions/globalTypes";
import { NOTIFY_TYPES } from "./redux/actions/notifyAction";
import audiobell from "./audio/bells.mp3";
import { MESS_TYPES } from "./redux/actions/messageAction";

const spawnNotification = (body, icon, url, title) => {
  let options = {
    body,
    icon,
  };
  let n = new Notification(title, options);

  n.onclick = (e) => {
    e.preventDefault();
    window.open(url, "_blank");
  };
}

const SocketClient = () => {
  const { auth, socket, notify } = useSelector((state) => state);
  const dispatch = useDispatch();

  const audioRef = useRef();

  // // joinUser
  useEffect(() => {
    socket.emit("joinUser", auth.user._id);
  }, [socket, auth.user._id]);

  // // likes
  useEffect(() => {
    socket.on("likeToClient", (newPost) => {
      dispatch({ type: POST_TYPES.UPDATE_POST, payload: newPost });
    });
    return () => socket.off("likeToClient");
  }, [socket, dispatch]);

  // // unlikes
  useEffect(() => {
    socket.on("unLikeToClient", (newPost) => {
      // console.log(newPost)
      dispatch({ type: POST_TYPES.UPDATE_POST, payload: newPost });
    });
    return () => socket.off("unLikeToClient");
  }, [socket, dispatch]);

  // Comments
  useEffect(() => {
    socket.on("createCommentToClient", (newPost) => {
      dispatch({ type: POST_TYPES.UPDATE_POST, payload: newPost });
    });
    return () => socket.off("createCommentToClient");
  }, [socket, dispatch]);

  //Delete Comments
  useEffect(() => {
    socket.on("deleteCommentToClient", (newPost) => {
      dispatch({ type: POST_TYPES.UPDATE_POST, payload: newPost });
    });
    return () => socket.off("deleteCommentToClient");
  }, [socket, dispatch]);

  // Follow
  useEffect(() => {
    socket.on("followToClient", (newUser) => {
      dispatch({ type: GLOBALTYPES.AUTH, payload: { ...auth, user: newUser } });
    });
    return () => socket.off("followToClient");
  }, [socket, dispatch, auth]);

  // UnFollow
  useEffect(() => {
    socket.on("unfollowToClient", (newUser) => {
      dispatch({ type: GLOBALTYPES.AUTH, payload: { ...auth, user: newUser } });
    });
    return () => socket.off("unfollowToClient");
  }, [socket, dispatch, auth]);

  // Notification
  useEffect(() => {
    socket.on("createNotifyToClient", (msg) => {

      dispatch({ type: NOTIFY_TYPES.CREATE_NOTIFY, payload: msg });
      
      if(notify.sound) audioRef.current.play();

      spawnNotification(
        msg.user.username + " " + msg.text,
        msg.user.avatar,
        msg.url,
        "Earth"
      );
    });
    return () => socket.off("createNotifyToClient");
  }, [socket, dispatch, notify.sound]);

  // Notification Delete
  useEffect(() => {
    socket.on("removeNotifyToClient", (msg) => {
      dispatch({ type: NOTIFY_TYPES.REMOVE_NOTIFY, payload: msg });
    });
    return () => socket.off("removeNotifyToClient");
  }, [socket, dispatch]);

  // Message
    useEffect(() => {
      socket.on("addMessageToClient", (msg) => {
        dispatch({type: MESS_TYPES.ADD_MESSAGE, payload: msg})
      });
      return () => socket.off("addMessageToClient");
    }, [socket, dispatch]);


  return (
    <>
      <audio controls ref={audioRef} style={{display:'none'}} >
        <source src={audiobell} type="audio/mp3" />
      </audio>
    </>
  );
}

export default SocketClient;
