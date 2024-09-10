import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Avatar from "./Avatar";
import notifypic from "../images/images.png";

const NotifyModel = () => {
  const { auth, notify } = useSelector((state) => state);
  const dispatch = useDispatch();

  return (
    <div style={{ minWidth: "280px" }}>
      <div className="d-flex justify-content-between align-items-center px-3">
        <h3>
          {notify.sound ? (
            <i
              className="fas fa-bell text-danger"
              style={{ fontSize: "1.2rem", cursor: "pointer" }}
            />
          ) : (
            <i
              className="fas fa-bell-slash text-danger"
              style={{ fontSize: "1.2rem", cursor: "pointer" }}
            />
          )}
        </h3>
      </div>
      <hr className="mt-0" />

      {notify.data.length === 0 && (
        <img src={notifypic} alt="notifypic" className="w-100" />
      )}

      <div style={{ maxHeight: "calc(100vh - 200px)", overflow: "auto" }}>
        {notify.data.map((msg, index) => (
          <div key={index} className="px-2 mb-3">
            <Link to={`${msg.url}`}>
              <Avatar src={msg.user.avatar} size="big-avatar" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotifyModel;
