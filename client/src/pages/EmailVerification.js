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
    <div>
      <h2>Email Verification</h2>
      {alert.error && <p style={{ color: "red" }}>{alert.error}</p>}
      {alert.success && <p style={{ color: "green" }}>{alert.success}</p>}
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "5px" }}>
        {codes.map((code, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            value={code}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleBackspace(e, index)}
            style={{
              width: "40px",
              height: "40px",
              fontSize: "20px",
              textAlign: "center",
            }}
            required
          />
        ))}
        <button type="submit">Verify</button>
      </form>
    </div>
  );
};

export default EmailVerification;
