import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "../Avatar";
import { GLOBALTYPES } from "../../redux/actions/globalTypes";
import { addMessage } from "../../redux/actions/messageAction";
import CallRing from "../../audio/calling.mp3";

const CallModal = () => {
  const { call, auth, peer, socket, theme } = useSelector((state) => state);
  const dispatch = useDispatch();

  const [hours, setHours] = useState(0);
  const [mins, setMins] = useState(0);
  const [second, setSecond] = useState(0);
  const [total, setTotal] = useState(0);
  const [answer, setAnswer] = useState(false);
  const [tracks, setTrack] = useState([]);
  const [newCall, setNewCall] = useState(null);
  const [micOn, setMicOn] = useState(true);

  const youVideo = useRef();
  const otherVideo = useRef();

  //   Set Time
  useEffect(() => {
    const setTime = () => {
      setTotal((t) => t + 1);
      setTimeout(setTime, 1000);
    };
    setTime();

    return () => setTotal(0);
  }, []);

  useEffect(() => {
    setSecond(total % 60);
    setMins(parseInt(total / 60));
    setHours(parseInt(total / 3660));
  }, [total]);

  //   End Call
  const addCallMessage = useCallback(
    (call, times, disconnect) => {
      if (call.recipient !== auth.user._id || disconnect) {
        const msg = {
          sender: call.sender,
          recipient: call.recipient,
          text: "",
          media: [],
          call: { video: call.video, times },
          createdAt: new Date().toISOString(),
        };
        dispatch(addMessage({ msg, auth, socket }));
      }
    },
    [dispatch, socket, auth]
  );

  const handleEndCall = () => {
    tracks && tracks.forEach((track) => track.stop());
    if (newCall) newCall.close();
    let times = answer ? total : 0;
    socket.emit("endCall", { ...call, times });

    addCallMessage(call, times);
    dispatch({ type: GLOBALTYPES.CALL, payload: null });
  };

  useEffect(() => {
    if (answer) {
      setTotal(0);
    } else {
      const timer = setTimeout(() => {
        socket.emit("endCall", { ...call, times: 0 });
        addCallMessage(call, 0);
        dispatch({ type: GLOBALTYPES.CALL, payload: null });
      }, 15000);

      return () => clearTimeout(timer);
    }
  }, [dispatch, answer, call, socket, addCallMessage]);

  useEffect(() => {
    socket.on("endCallToClient", (data) => {
      tracks && tracks.forEach((track) => track.stop());
      if (newCall) newCall.close();
      addCallMessage(data, data.times);
      dispatch({ type: GLOBALTYPES.CALL, payload: null });
    });

    return () => socket.off("endCallToClient");
  }, [socket, dispatch, tracks, addCallMessage, newCall]);

  // Stream Media
  // const openStream = (video) => {
  //   const config = { audio: true, video };
  //   return navigator.mediaDevices.getUserMedia(config);
  // };
  const openStream = (constraints) => {
    const config = {
      audio: true,
      video: { facingMode: constraints.facingMode },
    };
    return navigator.mediaDevices.getUserMedia(config);
  };

  const playStream = (tag, stream) => {
    let video = tag;
    video.srcObject = stream;
    video.play();
  };

  // Exchange if you need

  // const playStream = (tag, stream) => {
  //   let video = tag;
  //   if (!video.paused) {
  //     video.pause(); // Pause the video before setting a new source
  //   }

  //   video.srcObject = stream;

  //   video.play().catch((error) => {
  //     if (error.name === "AbortError") {
  //       console.log("Playback was interrupted due to a new load request.");
  //     } else {
  //       console.error("Error during video playback:", error);
  //     }
  //   });
  // };

  // Answer Call
  const HandleAnswer = () => {
    openStream(call.video).then((stream) => {
      playStream(youVideo.current, stream);
      const track = stream.getTracks();
      setTrack(track);

      const newCall = peer.call(call.peerId, stream);
      newCall.on("stream", function (remoteStream) {
        playStream(otherVideo.current, remoteStream);
      });

      setAnswer(true);
      setNewCall(newCall);
    });
  };

  useEffect(() => {
    peer.on("call", (newCall) => {
      openStream(call.video).then((stream) => {
        if (youVideo.current) {
          playStream(youVideo.current, stream);
        }
        const track = stream.getTracks();
        setTrack(track);
        newCall.answer(stream);
        newCall.on("stream", function (remoteStream) {
          if (otherVideo.current) {
            playStream(otherVideo.current, remoteStream);
          }
        });
        setAnswer(true);
        setNewCall(newCall);
      });
    });

    return () => peer.removeListener("call");
  }, [peer, call.video]);

  // Disconnect
  useEffect(() => {
    socket.on("callerDisconnect", () => {
      tracks && tracks.forEach((track) => track.stop());
      if (newCall) newCall.close();
      let times = answer ? total : 0;
      addCallMessage(call, times, true);
      dispatch({ type: GLOBALTYPES.CALL, payload: null });
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: `The ${call.username} disconnect` },
      });
    });

    return () => socket.off("callerDisconnect");
  }, [socket, tracks, dispatch, call, answer, total, addCallMessage, newCall]);

  // Play - Pause Audio
  const playAudio = (newAudio) => {
    newAudio.play();
  };

  // If you need changes then change but some problems occurs
  // const playAudio = (newAudio) => {
  //   newAudio
  //     .play()
  //     .then(() => {
  //       console.log("Audio is playing!");
  //     })
  //     .catch((error) => {
  //       console.error("Error playing audio:", error);
  //     });
  // };

  const pauseAudio = (newAudio) => {
    newAudio.pause();
    newAudio.currentTime = 0;
  };

  useEffect(() => {
    let newAudio = new Audio(CallRing);
    if (answer) {
      pauseAudio(newAudio);
    } else {
      playAudio(newAudio);
    }

    return () => pauseAudio(newAudio);
  }, [answer]);

const HandleSwitchCamera = async () => {
  try {
    // Find the current video track
    const currentTrack = tracks.find((track) => track.kind === "video");

    if (!currentTrack) return;

    // Determine the new facing mode
    const currentSettings = currentTrack.getSettings();
    const newFacingMode =
      currentSettings.facingMode === "user" ? "environment" : "user";

    // Stop the current video track
    currentTrack.stop();

    // Open a new stream with the new facing mode
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: newFacingMode },
      audio: true, // Keep audio consistent
    });

    // Get the new video track from the new stream
    const newVideoTrack = newStream.getVideoTracks()[0];

    // Replace the current track with the new track in the existing connection
    const sender = newCall?.peerConnection
      ?.getSenders()
      .find((s) => s.track.kind === "video");

    if (sender) {
      await sender.replaceTrack(newVideoTrack);

      // Play the new stream in the local video element
      playStream(youVideo.current, newStream);

      // Update the tracks state with the new track
      setTrack(newStream.getTracks());
    } else {
      console.error("No video sender found.");
    }
  } catch (error) {
    console.error("Error switching camera:", error);
  }
};


  const HandleMicrophone = () => {
    setMicOn((prevMicOn) => {
      // Toggle micOn state
      const newMicStatus = !prevMicOn;

      // Find the current audio track
      const audioTrack = tracks.find((track) => track.kind === "audio");
      if (audioTrack) {
        audioTrack.enabled = newMicStatus; // Enable/disable audio
      }

      return newMicStatus;
    });
  };

  return (
    <div className="call_modal">
      <div
        className="call_box"
        style={{
          display: answer && call.video ? "none" : "flex",
        }}
      >
        <div className="text-center" style={{ padding: "40px 0" }}>
          <Avatar src={call.avatar} size="supper-avatar" />
          <h4>{call.username}</h4>
          <h6>{call.fullname}</h6>

          {answer ? (
            <div>
              <span>{hours.toString().length < 2 ? "0" + hours : hours}</span>
              <span>:</span>
              <span>{mins.toString().length < 2 ? "0" + mins : mins}</span>
              <span>:</span>
              <span>
                {second.toString().length < 2 ? "0" + second : second}
              </span>
            </div>
          ) : (
            <div>
              {call.video ? (
                <span>calling video...</span>
              ) : (
                <span>calling audio...</span>
              )}
            </div>
          )}
        </div>

        {!answer && (
          <div className="timer">
            <small>{mins.toString().length < 2 ? "0" + mins : mins}</small>
            <small>:</small>
            <small>
              {second.toString().length < 2 ? "0" + second : second}
            </small>
          </div>
        )}

        <div className="call_menu">
          <button
            className="material-icons text-danger"
            onClick={handleEndCall}
          >
            call_end
          </button>

          {call.recipient === auth.user._id && !answer && (
            <>
              {call.video ? (
                <button
                  className="material-icons text-success"
                  onClick={HandleAnswer}
                >
                  videocam
                </button>
              ) : (
                <button
                  className="material-icons text-success"
                  onClick={HandleAnswer}
                >
                  call
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div
        className="show_video"
        style={{
          opacity: answer && call.video ? "1" : "0",
          filter: theme ? "invert(1)" : "invert(0)",
        }}
      >
        <i
          className="fas fa-sync-alt switch_camera"
          onClick={HandleSwitchCamera}
        />

        <video ref={youVideo} className="you_video" playsInline muted />
        <video ref={otherVideo} className="other_video" playsInline />

        <div className="time_video">
          <span>{hours.toString().length < 2 ? "0" + hours : hours}</span>
          <span>:</span>
          <span>{mins.toString().length < 2 ? "0" + mins : mins}</span>
          <span>:</span>
          <span>{second.toString().length < 2 ? "0" + second : second}</span>
        </div>

        <button
          className="material-icons text-danger end_call"
          onClick={handleEndCall}
        >
          call_end
        </button>
        <i
          className={`fa ${
            micOn ? "fa-microphone" : "fa-microphone-slash"
          } Mic_Off`}
          onClick={HandleMicrophone}
        />
      </div>
    </div>
  );
};

export default CallModal;
