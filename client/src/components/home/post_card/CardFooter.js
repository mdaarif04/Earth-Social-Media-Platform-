import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Send from "../../../images/send.svg";
import LikeButton from "../../LikeButton";
import { useSelector, useDispatch } from "react-redux";
import { likePost, savePost, unLikePost, unSavePost } from "../../../redux/actions/postAction";
import ShareModel from "../../ShareModel";
import {BASE_URL} from '../../../utils/config'

const CardFooter = ({ post }) => {
  const [isLike, setIsLike] = useState(false);
  const [loadLike, setLoadLike] = useState(false);

  const [isShare, setIsShare] = useState(false)

  const { auth, theme, socket } = useSelector((state) => state);
  const dispatch = useDispatch();

  const [saved, setSaved] = useState(false)
  const [saveLoad, setSaveLoad] = useState(false)
  
  //  Likes
  useEffect(() => {
    if (post.likes.find(like => like._id === auth.user._id)) {
      setIsLike(true)
    }else{
      setIsLike(false)
    }
  }, [post.likes, auth.user._id])
  

  const handleLike = async () => {
    if (loadLike) return;

    setLoadLike(true);
    await dispatch(likePost({ post, auth, socket }))
    setLoadLike(false)
  };

  const handleUnLike = async() => {
    if (loadLike) return;

    setLoadLike(true);
    await dispatch(unLikePost({ post, auth, socket }));
    setLoadLike(false);
  };

  //  Saved
  useEffect(() => {
    if (auth.user.saved.find(id => id === post._id)) {
      setSaved(true)
    }else{
      setSaved(false)
    }
  },[auth.user.saved, post._id])
  
  const handleSavePost = async () => {
    if (saveLoad) return;

    setSaveLoad(true);
    await dispatch(savePost({post, auth})) 
    setSaveLoad(false);
  };

  const handleUnSavePost = async() => {
    if (saveLoad) return;

    setSaveLoad(true);
    await dispatch(unSavePost({post, auth}))
    setSaveLoad(false);
  };

  return (
    <div className="card_footer">
      <div className="card_icon_menu">
        <div >
          <LikeButton
            isLike={isLike}
            handleLike={handleLike}
            handleUnLike={handleUnLike}
          />

          <Link className="text-dark" to={`/post/${post._id}`}>
            <i className="far fa-comment" />
          </Link>
          <img src={Send} alt="Send" onClick={() => setIsShare(!isShare)}/>
        </div>
        {
          saved
          ? <i className="fas fa-bookmark text-info"
          onClick={handleUnSavePost} />

          : <i className="far fa-bookmark" 
          onClick={handleSavePost} />
        }
        
      </div>
       <div className="d-flex justify-content-between">
        <h6 style={{ padding: "0 34px", cursor: "pointer" }}>
          {post.likes.length}
        </h6>
        <h6 style={{ padding: "0 34px", cursor: "pointer" }}>
          {post.comments.length} comments{" "}
        </h6>
      </div>

      {
        isShare && 
        <ShareModel url={`${BASE_URL}/post/${post._id}`} theme={theme} />
      }
    </div>
  );
};

export default CardFooter;
