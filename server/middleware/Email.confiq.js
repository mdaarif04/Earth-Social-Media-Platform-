const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: "cricketlive1543@gmail.com",
    pass: "tthltwolzceloabe",
  },
});

module.exports = transporter;