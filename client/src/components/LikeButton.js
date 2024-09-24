import React from "react";
import { useSelector } from "react-redux";
import './style.css'

const LikeButton = ({ isLike, handleLike, handleUnLike }) => {
  const { theme } = useSelector((state) => state.theme);


  return (
    <>
      {isLike ? (
        <i
          id="btn1"
          // fas fa-heart text-danger
          className="fas fa-heart" 
          onClick={handleUnLike}
          style={{ filter: theme ? "invert(1)" : "invert(0)" }}
        />
      ) : (
        <i className="far fa-heart" onClick={handleLike} />
      )}
    </>
  );
};

export default LikeButton;
