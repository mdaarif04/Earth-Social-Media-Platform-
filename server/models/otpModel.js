const mongose  = require('mongoose')

const otpShcema = new mongose.Schema(
  {
    email: String,
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verficationToken: String,
    verficationTokenExpiresAt: Date,
  },
  { timestamps: true }
);

module.exports = mongose.model("otp", otpShcema)
