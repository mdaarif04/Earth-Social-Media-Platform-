const Users = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetVerification,
  sendPasswordChangeConfirmation,
  RemainderEmail,
} = require("../middleware/Email");
const otp = require("../models/otpModel");
const cron = require("node-cron");
const moment = require("moment");

const authCtrl = {
  register: async (req, res) => {
    try {
      const { fullname, username, email, password, gender } = req.body;
      let newUserName = username.toLowerCase().replace(/ /g, "");

      const user_name = await Users.findOne({ username: newUserName });
      if (user_name)
        return res.status(400).json({ msg: "This username already exists." });

      const user_email = await Users.findOne({ email });
      if (user_email)
        return res.status(400).json({ msg: "This email already exists." });

      if (password.length < 6) {
        return res
          .status(400)
          .json({ msg: "Password must be at least 6 characters." });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const verficationToken = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      const newUser = new Users({
        fullname,
        username: newUserName,
        email,
        password: passwordHash,
        gender,
        verficationToken,
        verficationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });

      const access_token = createAccessToken({ id: newUser._id });
      const refresh_token = createRefreshToken({ id: newUser._id });

      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/api/refresh_token",
        maxAge: 30 * 7 * 24 * 60 * 1000,
      });

      await newUser.save();
      await sendVerificationEmail(newUser.email, verficationToken);
      // Please verify your email.
      res.json({
        msg: "Please verify your email  ",
        access_token,
        user: {
          ...newUser._doc,
          password: "",
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await Users.findOne({ email }).populate(
        "followers following",
        "avatar username fullname followers following"
      );

      if (!user)
        return res.status(400).json({ msg: "This email does not exist." });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ msg: "Password is incorrect." });

      if (!user.isVerified) {
        return res.status(403).json({
          success: false,
          message:
            "Email not verified. Please check your email to verify your account.",
        });
      }

      user.lastLogin = Date.now();
      await user.save();

      const access_token = createAccessToken({ id: user._id });
      const refresh_token = createRefreshToken({ id: user._id });

      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/api/refresh_token",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.json({
        msg: "Login Success!",
        access_token,
        user: {
          ...user._doc,
          password: "",
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  VerfiyEmail: async (req, res) => {
    try {
      const { code } = req.body;
      const user = await Users.findOne({
        verficationToken: code,
        verficationTokenExpiresAt: { $gt: Date.now() },
      });
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Inavlid or Expired Code" });
      }

      user.isVerified = true;
      user.verficationToken = undefined;
      user.verficationTokenExpiresAt = undefined;
      await user.save();
      await sendWelcomeEmail(user.email, user.fullname);
      return res
        .status(200)
        .json({ success: true, message: "Email Verifed Successfully" });
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .json({ success: false, message: "internal server error" });
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie("refreshtoken", { path: "/api/refresh_token" });
      return res.json({ msg: "Logged out!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  emailSend: async (req, res) => {
    try {
      const { email } = req.body;

      const user = await Users.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: "This email does not exist." });
      }

      const verficationToken = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      const otpdata = new otp({
        email,
        verficationToken,
        verficationTokenExpiresAt: Date.now() + 15 * 60 * 1000,
      });

      await otpdata.save();
      await sendResetVerification(user.email, verficationToken);

      res.json({
        msg: "Please verify your email  ",
        otpdata,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { code, newPassword } = req.body;

      const otpEntry = await otp.findOne({
        verficationToken: code,
        verficationTokenExpiresAt: { $gt: Date.now() },
      });

      if (!otpEntry) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or Expired Code" });
      }

      const user = await Users.findOne({ email: otpEntry.email });

      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "User not found." });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ msg: "Password must be at least 6 characters." });
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);

      user.password = passwordHash;
      await otp.deleteOne({ _id: otpEntry._id });

      await user.save();

      await sendPasswordChangeConfirmation(user.email, user.fullname);

      res
        .status(200)
        .json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.log("Error in changePassword:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  },

  sendReminderEmails: async () => {
    try {
      const thresholdDate = moment().subtract(5, "days").toDate(); // 5, "days"
      // console.log("Threshold Date:", thresholdDate);

      const inactiveUsers = await Users.find({
        lastLogin: { $lt: thresholdDate },
        isVerified: true,
      });

      for (const user of inactiveUsers) {
        await RemainderEmail(user.email, user.fullname);
        // console.log(`Reminder email sent to ${user.email}`);
      }
    } catch (error) {
      console.error("Error in sending reminder emails:", error.message);
    }
  },

  generateAccessToken: async (req, res) => {
    try {
      const ref_token = req.cookies.refreshtoken;
      if (!ref_token) return res.status(400).json({ msg: "Please login now." });

      jwt.verify(
        ref_token,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, result) => {
          if (err) return res.status(400).json({ msg: "Please login now." });

          const user = await Users.findById(result.id)
            .select("-password")
            .populate(
              "followers following",
              "avatar username fullname followers following"
            );
          if (!user)
            return res.status(400).json({ msg: "This does not exist." });

          const access_token = createAccessToken({ id: result.id });
          res.json({
            access_token,
            user,
          });
        }
      );
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

cron.schedule("0 0 * * *", async () => {
  // console.log("Cron job triggered at midnight");
  await authCtrl.sendReminderEmails();
});


const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = authCtrl;
