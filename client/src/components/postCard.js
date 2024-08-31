import React from "react";
import CardHeader from "./home/post_card/CardHeader";
import CardBody from "./home/post_card/CardBody";
import CardFooter from "./home/post_card/CardFooter";

import Comment from "./home/Comments";
import InputComment from "./home/InputComment";

const postCard = ({ post }) => {
  return (
    <div className="card my-3">
      <CardHeader post={post} />
      <CardBody post={post} />
      <CardFooter post={post} />

      <Comment post={post} />
      <InputComment post={post} />
    </div>
  );
};

export default postCard;
