import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GLOBALTYPES } from "../redux/actions/globalTypes";
import { createPost, updatePost } from "../redux/actions/postAction";
import Icons from "./icons";
import { imageShow, videoShow } from "../utils/mediaShow";

const StatusModal = () => {
  const { auth, theme, status, socket } = useSelector((state) => state);
  const dispatch = useDispatch();

  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);

  const [stream, setStream] = useState(false);

  const videoref = useRef();
  const refCanvas = useRef();

  const [tracks, setTracks] = useState([]);

  const handleChangeImages = (e) => {
    const files = [...e.target.files];
    let err = "";
    let newImages = [];

    files.forEach((file) => {
      if (!file) return (err = "File does not exist.");

      if (file.size > 1024 * 1024 * 5) {
        return (err = "The Image/video largest is 5mb.");
      }
      return newImages.push(file);
    });

    if (err) dispatch({ type: GLOBALTYPES.ALERT, payload: { error: err } });
    setImages([...images, ...newImages]);
  };

  const deleteImages = (index) => {
    const newArr = [...images];
    newArr.splice(index, 1);
    setImages(newArr);
  };

const [cameraFacingMode, setCameraFacingMode] = useState("user"); // Default to user camera

const handleStream = () => {
  setStream(true);
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: cameraFacingMode } }) // Use the current camera mode
      .then((mediaStream) => {
        videoref.current.srcObject = mediaStream;
        videoref.current.play();
        setTracks(mediaStream.getVideoTracks()); // Store the video tracks
      })
      .catch((err) => console.log(err));
  }
};

  useEffect(() => {
    if (status.onEdit) {
      setContent(status.content);
      setImages(status.images);
    }
  }, [status]);

  const handleCapture = () => {
    const width = videoref.current.clientWidth;
    const height = videoref.current.clientHeight;

    refCanvas.current.setAttribute("width", width);
    refCanvas.current.setAttribute("height", height);

    const ctx = refCanvas.current.getContext("2d");
    ctx.drawImage(videoref.current, 0, 0, width, height);
    let URL = refCanvas.current.toDataURL();
    setImages([...images, { camera: URL }]);
  };

const handleStopStream = () => {
  if (tracks && tracks.length > 0) {
    tracks.forEach((track) => track.stop()); // Loop through tracks and stop each one
  }
  setStream(false);
};


 const handleSubmit = (e) => {
   e.preventDefault();

   if (images.length === 0)
     return dispatch({
       type: GLOBALTYPES.ALERT,
       payload: { error: "Please add your photo." },
     });

   if (status.onEdit) {
     dispatch(updatePost({ content, images, auth, status }));
   } else {
     dispatch(createPost({ content, images, auth, socket }));
   }

   // Reset content and images
   setContent("");
   setImages([]);

   // Stop the tracks correctly
   if (tracks && tracks.length > 0) {
     tracks.forEach((track) => track.stop()); // Stop each track
   }

   // Close the status
   dispatch({ type: GLOBALTYPES.STATUS, payload: false });
 };


  useEffect(() => {
    if (status.onEdit) {
      setContent(status.content);
      setImages(status.images);
    }
  }, [status]);

  const handleChangeCamera = () => {
    // Stop the current stream
    if (tracks.length > 0) {
      tracks.forEach((track) => track.stop());
    }

    // Toggle cameraFacingMode
    setCameraFacingMode((prevMode) =>
      prevMode === "user" ? "environment" : "user"
    );

    // Restart the stream with the new camera mode
    handleStream();
  };

  return (
    <div className="status_modal">
      <form onSubmit={handleSubmit}>
        <div className="status_header">
          <h5 className="m-0">Create Post</h5>
          <span
            onClick={() =>
              dispatch({
                type: GLOBALTYPES.STATUS,
                payload: false,
              })
            }
          >
            &times;
          </span>
        </div>

        <div className="status_body">
          <textarea
            name="content"
            value={content}
            placeholder={`${auth.user?.username}, what are you thinking?`}
            onChange={(e) => setContent(e.target.value)}
            style={{
              filter: theme ? "invert(1)" : "invert(0)",
              color: theme ? "white" : "#111",
              background: theme ? "rgba(0,0,0,.03)" : "",
            }}
          />

          <div className="d-flex">
            <div className="flex-fill"></div>
            <Icons setContent={setContent} content={content} theme={theme} />
          </div>

          <div className="show_images">
            {images.map((img, index) => (
              <div key={index} id="file_img">
                {img.camera ? (
                  imageShow(img.camera, theme)
                ) : img.url ? (
                  <>
                    {img.url.match(/video/i)
                      ? videoShow(img.url, theme)
                      : imageShow(img.url, theme)}
                  </>
                ) : (
                  <>
                    {img.type.match(/video/i)
                      ? videoShow(URL.createObjectURL(img), theme)
                      : imageShow(URL.createObjectURL(img), theme)}
                  </>
                )}
                <span onClick={() => deleteImages(index)}>&times;</span>
              </div>
            ))}
          </div>

          {stream && (
            <div className="stream">
              <video
                src=""
                autoPlay
                muted
                ref={videoref}
                width="100%"
                height="100%"
                style={{ filter: theme ? "invert(1)" : "invert(0)" }}
              />
              <span onClick={handleStopStream}>&times;</span>
              <canvas ref={refCanvas} style={{ display: "none" }} />
            </div>
          )}

          <div className="input_images">
            {stream ? (
              <>
                <i className="fas fa-camera" onClick={handleCapture} />
                <i className="fas fa-sync-alt" onClick={handleChangeCamera} />
              </>
            ) : (
              <>
                {" "}
                <i className="fas fa-camera" onClick={handleStream} />
                <div className="file_upload">
                  <i className="fas fa-image" />
                  <input
                    type="file"
                    name="file"
                    id="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleChangeImages}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="status_footer">
          <button className="btn btn-secondary w-100" type="submit">
            Post
          </button>
        </div>
      </form>
    </div>
  );
};

export default StatusModal;
