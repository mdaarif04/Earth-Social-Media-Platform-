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
  // Stop all media tracks
  if (tracks && tracks.length > 0) {
    tracks.forEach((track) => {
      track.stop(); // This should stop the camera and audio
    });
    setTrack([]); // Clear the tracks array
  }

  if (newCall) {
    newCall.close(); // Close the current call
  }

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

const openStream = (facingMode = "user") => {
  const config = {
    audio: true, // Enable audio
    video: {
      facingMode: facingMode, // Set the camera facing mode (user or environment)
    },
  };
  return navigator.mediaDevices.getUserMedia(config); // Request access to media devices
};



const playStream = (tag, stream) => {
  let video = tag;

  if (!video.paused) {
    video.pause(); // Pause the video before setting a new source
  }

  video.srcObject = stream; // Set the new stream

  video.onloadedmetadata = () => {
    video
      .play()
      .then(() => {
        console.log("Video is playing"); // Log success
      })
      .catch((error) => {
        console.error("Error during video playback:", error);
      });
  };
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

const HandleAnswer = () => {
  openStream(call.video)
    .then((stream) => {
      playStream(youVideo.current, stream); // Play the local stream
      const track = stream.getTracks();
      setTrack(track);

      // Answer the call with the new stream
      const newCall = peer.call(call.peerId, stream);
      newCall.on("stream", function (remoteStream) {
        playStream(otherVideo.current, remoteStream); // Play the remote stream
      });

      setAnswer(true); // Update the state to indicate the call is answered
      setNewCall(newCall);
    })
    .catch((error) => {
      console.error("Error answering call:", error);
    });
};


 useEffect(() => {
   peer.on("call", (newCall) => {
     openStream(call.video ? "user" : "environment").then((stream) => {
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

  const [isFrontCamera, setIsFrontCamera] = useState(true); // Track camera facing

const handleChangeCamera = () => {
  // Stop current tracks
  if (tracks && tracks.length > 0) {
    tracks.forEach((track) => track.stop()); // Stop the current video and audio tracks
  }

  const facingMode = isFrontCamera ? "environment" : "user"; // Toggle between front and back

  openStream(facingMode) // No need to pass call.video here
    .then((stream) => {
      console.log("New stream:", stream); // Log the stream
      playStream(youVideo.current, stream); // Play the new stream

      const newTracks = stream.getTracks();
      setTrack(newTracks); // Update the track state

      // If there's an existing call, close it
      if (newCall) {
        newCall.close();
      }

      // Start a new call with the updated stream
      const updatedCall = peer.call(call.peerId, stream);
      updatedCall.on("stream", function (remoteStream) {
        playStream(otherVideo.current, remoteStream); // Play the remote stream for the other user
      });

      setNewCall(updatedCall); // Set the new call
    })
    .catch((error) => {
      console.error("Error switching camera:", error);
    });

  // Toggle the camera state for the next switch
  setIsFrontCamera(!isFrontCamera);
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
          background: "black",
        }}
      >
        <video ref={youVideo} className="you_video" playsInline muted />
        <video ref={otherVideo} className="other_video" playsInline />

        <div className="time_video">
          <span>{hours.toString().length < 2 ? "0" + hours : hours}</span>
          <span>:</span>
          <span>{mins.toString().length < 2 ? "0" + mins : mins}</span>
          <span>:</span>
          <span>{second.toString().length < 2 ? "0" + second : second}</span>
        </div>

        <div
          className="show_video"
          style={{
            opacity: answer && call.video ? "1" : "0",
            filter: theme ? "invert(1)" : "invert(0)",
            background: "black",
          }}
        >
          {/* Video for yourself */}
          <video ref={youVideo} className="you_video" playsInline muted />

          {/* Video for the other user */}
          <video ref={otherVideo} className="other_video" playsInline />

          {/* Time display */}
          <div className="time_video">
            <span>{hours.toString().length < 2 ? "0" + hours : hours}</span>
            <span>:</span>
            <span>{mins.toString().length < 2 ? "0" + mins : mins}</span>
            <span>:</span>
            <span>{second.toString().length < 2 ? "0" + second : second}</span>
          </div>

          {/* End Call Button */}
          <button
            className="material-icons text-danger end_call"
            onClick={handleEndCall}
          >
            call_end
          </button>

          <button
            className="fas fa-sync-alt switch_camera" // Adjusted class name with icon
            onClick={handleChangeCamera}
            aria-label="Switch Camera" // Accessibility for screen readers
          >
            
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallModal;
