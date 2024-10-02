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
  }

  return (
    <>
      <div className="chat_title">
        <Avatar src={user.avatar} size="small-avatar" />
        <span style={{ opacity: 0.6 }}>{user.username}</span>
      </div>

      <div className="you_content">
        {user._id === auth.user._id && (
          <i
            className="fas fa-trash text-danger"
            onClick={HandleDeleteMessage}
          />
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
          {msg.media?.map((item, index) => (
            <div key={index}>
              {item.url.match(/video/i)
                ? videoShow(item.url, theme)
                : imageShow(item.url, theme)}
            </div>
          ))}
        </div>

        {
          msg.call && 
          <button className="btn d-flex align-items-center py-3"
          style={{background: "#eee", borderRadius:'10px'}}>
            <spna className="material-icons font-weight-bold mr-1"
            style={{fontSize: "2.5rem", color: msg.call.times === 0 ? 'crimson': 'green',
              filter: theme ? 'invert(1)' : 'invert(0)'
            }}>
              {
                msg.call.times === 0 
                ? msg.call.video ? 'videocam_off' : 'phone_disabled'
                : msg.call.video ? 'videocam_front' : 'call'
              }
            </spna>

            <div className="text_left">
              <h6>{msg.call.video ? 'Video Call' : 'Audio Call'}</h6>
              <small>
                {
                  msg.call.times > 0
                  ? <Times />
                  : new Date(msg.call.times).toLocaleTimeString() 
                }
              </small>
            </div>

          </button>
        }

      </div>


      <div className="chat_time">
        {new Date(msg.createdAt).toLocaleString()}
      </div>
    </>
  );
};

export default MsgDisplay;
