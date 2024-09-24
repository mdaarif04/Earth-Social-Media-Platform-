import React from "react";
import LeftSide from "../../components/message/LeftSide";
import RightSide from "../../components/message/RightSide";

const Conversation = () => {
  // line 27 update css in usercard
  // line 9 and 14 update css 
  return (
    <div className="message d-flex">
      <div style={{ width: "30%" }}>
        <LeftSide />
      </div>

      <div style={{ width: "70%" }}>
        <RightSide />
      </div>
    </div>
  );
};

export default Conversation;
