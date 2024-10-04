import React from "react";
import Avatar from "../Avatar";
import { imageShow, videoShow } from "../../utils/mediaShow";
import { useDispatch, useSelector } from "react-redux";
import { deleteMessages } from "../../redux/actions/messageAction";
import Times from "./Times";

const MsgDisplay = ({ user, msg, theme, data }) => {
  const { auth } = useSelector((state) => state);
  const dispatch = useDispatch();
  const HandleDeleteMessage = () => {
    if (!data) return;
    if (window.confirm("Do you want to delete?")) {
      dispatch(deleteMessages({ msg, data, auth }));
    }
  };

  // const downloadMedia
  // onClick={(e) => downloadMedia(e, message.text)}
  // export const downloadMedia = async (e, originalImage) => {
  //   e.preventDefault();
  //   try {
  //     fetch(originalImage)
  //       .then((resp) => resp.blob())
  //       .then((blob) => {
  //         const url = window.URL.createObjectURL(blob);
  //         const a = document.createElement("a");
  //         a.style.display = "none";
  //         a.href = url;

  //         const nameSplit = originalImage.split("/");
  //         const duplicateName = nameSplit.pop();

  //         // the filename you want
  //         a.download = "" + duplicateName + "";
  //         document.body.appendChild(a);
  //         a.click();
  //         window.URL.revokeObjectURL(url);
  //       })
  //       .catch((error) =>
  //         console.log("Error while downloading the image ", error)
  //       );
  //   } catch (error) {
  //     console.log("Error while downloading the image ", error.messages);
  //   }
  // };

  // const downloadMedia = async (originalImage) => {
  //   try {
  //     // Fetch the file from the URL
  //     fetch(originalImage)
  //       .then((resp) => resp.blob())
  //       .then((blob) => {
  //         const url = window.URL.createObjectURL(blob);
  //         const a = document.createElement("a");
  //         a.style.display = "none";
  //         a.href = url;

  //         const nameSplit = originalImage.split("/");
  //         const duplicateName = nameSplit.pop();

  //         // the filename you want
  //         a.download = "" + duplicateName + "";
  //         document.body.appendChild(a);
  //         a.click();
  //         window.URL.revokeObjectURL(url);
  //       });
  //   } catch (error) {
  //     console.error("Error downloading the file:", error);
  //   }
  // };

  return (
    <>
      <div className="chat_title">
        <Avatar src={user.avatar} size="small-avatar" />
        <span>{user.username}</span>
      </div>

      <div className="you_content">
        {user._id === auth.user._id && (
          <>
            <i
              className="fas fa-trash text-danger"
              onClick={HandleDeleteMessage}
            />
            {/* <i
              className="fas fa-download text-danger"
              onClick={(e) => downloadMedia(e, msg.text)}
            /> */}
          </>
        )}

        <div>
          {msg.text && (
            <div
              className="chat_text"
              style={{ filter: theme ? "invert(1)" : "invert(0)" }}
            >
              {msg.text}
            </div>
          )}
         
          {msg.media.map((item, index) => (
            <div key={index}>
              {item.url.match(/video/i)
                ? videoShow(item.url, theme)
                : imageShow(item.url, theme)}
            </div>
          ))}
        </div>

        {msg.call && (
          <button
            className="btn d-flex align-items-center py-3"
            style={{ background: "#eee", borderRadius: "10px" }}
          >
            <span
              className="material-icons font-weight-bold mr-1"
              style={{
                fontSize: "2.5rem",
                color: msg.call.times === 0 ? "crimson" : "green",
                filter: theme ? "invert(1)" : "invert(0)",
              }}
            >
              {msg.call.times === 0
                ? msg.call.video
                  ? "videocam_off"
                  : "phone_disabled"
                : msg.call.video
                ? "video_camera_front"
                : "call"}
            </span>

            <div className="text-left">
              <h6>{msg.call.video ? "Video Call" : "Audio Call"}</h6>
              <small>
                {msg.call.times > 0 ? (
                  <Times total={msg.call.times} />
                ) : (
                  new Date(msg.createdAt).toLocaleTimeString()
                )}
              </small>
            </div>
          </button>
        )}
      </div>

      <div className="chat_time">
        {new Date(msg.createdAt).toLocaleString()}
      </div>
    </>
  );
};

export default MsgDisplay;
