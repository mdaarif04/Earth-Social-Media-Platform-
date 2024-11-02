import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { changePassword } from "../../redux/actions/authAction";
import { useNavigate } from "react-router-dom";

const EmailVerify = () => {
  const dispatch = useDispatch();
  const [code, setCode] = useState(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleChange = (e, index) => {
    const { value } = e.target;
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) {
        document.getElementById(`digit-${index + 1}`).focus();
      }
    }
  };

  const handleSendEmail = () => {
    const verificationCode = code.join("");
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    
    dispatch(changePassword({ code: verificationCode, newPassword }));
    navigate("/");
  };

  return (
    <div className="container">
      <h2>Enter Verification Code</h2>
      <div className="input-container">
        {code.map((digit, index) => (
          <input
            key={index}
            id={`digit-${index}`}
            type="text"
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onFocus={(e) => e.target.select()}
            className="digit-input"
            maxLength="1"
          />
        ))}
      </div>

      <h3>Set New Password</h3>
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="password-input"
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="password-input"
      />

      <button onClick={handleSendEmail} className="verify-button">
        Verify Email
      </button>
    </div>
  );
};

export default EmailVerify;
