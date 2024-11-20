const transporter = require("./Email.confiq.js");
const {
  Verification_Email_Template,
  Welcome_Email_Template,
  ResetVerification_Email_Template,
  Pss_ChangeWelcome_Email_Template,
  Remainder_Email_Template,
} = require("./EmailTemplate.js");

const sendVerificationEmail = async (email, verificationCode) => {
  try {
      await transporter.sendMail({
        from: '"ARTalk" <cricketlive1543@gmail.com>',
        to: email,
        subject: "Verify your Email",
        text: "Verify your Email",
        html: Verification_Email_Template.replace(
          "{verificationCode}",
          verificationCode
        ),
      });
    // console.log("Email sent successfully", response);
  } catch (error) {
    console.log("Email error", error);
  }
};

const sendResetVerification = async (email, verificationCode, ) => {
  try {
      await transporter.sendMail({
        from: '"ARTalk" <cricketlive1543@gmail.com>',
        to: email,
        subject: "Change Password",
        text: "Verify your Email",
        html: ResetVerification_Email_Template.replace(
          "{verificationCode}",
          verificationCode,
        ),
      });
  } catch (error) {
    console.log("Email error", error);
  }
};

const sendWelcomeEmail = async (email, name) => {
  try {
      await transporter.sendMail({
        from: '"ARTalk" <cricketlive1543@gmail.com>',

        to: email,
        subject: "Welcome To ARTalk Community",
        text: "Welcome To ARTalk Community",
        html: Welcome_Email_Template.replace("{name}", name)
      });
    // console.log("Email sent successfully", response);
  } catch (error) {
    console.log("Email error", error);
  }
};

const sendPasswordChangeConfirmation = async (email, name) => {
  try {
    await transporter.sendMail({
      from: '"ARTalk" <cricketlive1543@gmail.com>',

      to: email,
      subject: "Password Change Successfully",
      text: "Welcome To ARTalk Community",
      html: Pss_ChangeWelcome_Email_Template.replace("{name}", name),
    });
    // console.log("Email sent successfully", response);
  } catch (error) {
    console.log("Email error", error);
  }
};
const RemainderEmail = async (email, name) => {
  try {
    const response = await transporter.sendMail({
      from: '"ARTalk" <cricketlive1543@gmail.com>',

      to: email,
      subject: "We Miss You at ARTalk!",
      text: "Welcome To ARTalk Community",
      html: Remainder_Email_Template.replace("{name}", name),
    });
    console.log("Email sent successfully", response);
  } catch (error) {
    console.log("Email error", error);
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetVerification,
  sendPasswordChangeConfirmation,
  RemainderEmail
};
