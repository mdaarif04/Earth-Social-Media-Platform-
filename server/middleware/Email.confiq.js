const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "cricketlive1543@gmail.com",
    pass: "tthltwolzceloabe",
  },
});

module.exports = transporter;