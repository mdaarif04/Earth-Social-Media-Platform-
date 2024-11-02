import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { sendVerificationEmail } from "../../redux/actions/authAction";
import { useNavigate } from "react-router-dom";

const EmailSend = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSendEmail = async () => {
    try {
        await dispatch(sendVerificationEmail(email));
        navigate("/emailverify");
        
    } catch (err) {
        console.log("Error Sending the Email ", err)
    }
  };

  return (
    <div className="container">
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleSendEmail}>Send Email</button>
    </div>
  );
};

export default EmailSend;
