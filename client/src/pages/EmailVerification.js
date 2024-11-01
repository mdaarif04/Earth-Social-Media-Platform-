import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { verifyEmail } from "../redux/actions/authAction";
import { useNavigate } from "react-router-dom";

const EmailVerification = () => {
  const dispatch = useDispatch();
  const [codes, setCodes] = useState(Array(6).fill(""));
  const { auth, alert } = useSelector((state) => state);

  const navigate = useNavigate();

  const handleChange = (e, index) => {
    const value = e.target.value.slice(-1);
    if (!/^\d$/.test(value) && value !== "") return;

    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);

    if (value && index < 5) {
      e.target.nextSibling.focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      e.target.previousSibling.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(verifyEmail(codes.join("")));
  };

  useEffect(() => {
    if (auth.token) {
      navigate("/");
    }
  }, [auth.token, navigate]);

  return (
    <div className="verification-container">
      <h2 className="verification-title">Email Verification</h2>
      {alert.error && <p className="alert error">{alert.error}</p>}
      {alert.success && <p className="alert success">{alert.success}</p>}
      <form onSubmit={handleSubmit} className="verification-form">
        <div className="input-container">
          {codes.map((code, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={code}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleBackspace(e, index)}
              className="verification-input"
              required
            />
          ))}
        </div>
        <button type="submit" className="verify-button">
          Verify
        </button>
      </form>
    </div>
  );
};

export default EmailVerification;
