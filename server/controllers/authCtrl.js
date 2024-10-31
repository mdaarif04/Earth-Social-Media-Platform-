const Users = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Token = require("../models/token");
// const crypto = require("crypto");
// const sendEmail = require("../utils/sendEmail");

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

      const newUser = new Users({
        fullname,
        username: newUserName,
        email,
        password: passwordHash,
        gender,
        // verified: false, // Add this field to track email verification status
      });

      const access_token = createAccessToken({ id: newUser._id });
      const refresh_token = createRefreshToken({ id: newUser._id });

      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/api/refresh_token",
        maxAge: 30 * 7 * 24 * 60 * 1000,
      });

      await newUser.save();

      // Generate a verification token and send the verification email
      // const token = new Token({
      //   userId: newUser._id,
      //   token: crypto.randomBytes(32).toString("hex"),
      // });
      // await token.save();

      // const url = `${process.env.BASE_URL}/api/auth/verify/${newUser._id}/${token.token}`;
      // await sendEmail(newUser.email, "Verify Email", url);

      // Please verify your email.
      res.json({
        msg: "Registered Success! ",
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

  verifyEmail: async (req, res) => {
    try {
      const user = await Users.findById(req.params.id);
      if (!user) return res.status(400).json({ msg: "Invalid link" });

      const token = await Token.findOne({
        userId: user._id,
        token: req.params.token,
      });
      if (!token)
        return res.status(400).json({ msg: "Invalid or expired link" });

      await Users.updateOne({ _id: user._id }, { verified: true });
      await token.remove();

      res.status(200).json({ msg: "Email verified successfully" });
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

      // Check if the user has verified their email
      // if (!user.verified) {
      //   return res
      //     .status(400)
      //     .json({ msg: "Please verify your email to login." });
      // }

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

  logout: async (req, res) => {
    try {
      res.clearCookie("refreshtoken", { path: "/api/refresh_token" });
      return res.json({ msg: "Logged out!" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
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
