const router = require("express").Router();
const authCtrl = require("../controllers/authCtrl");

router.post("/register", authCtrl.register);

router.post("/login", authCtrl.login);

router.post("/logout", authCtrl.logout);

router.post("/refresh_token", authCtrl.generateAccessToken);

router.post("/verifyEmail", authCtrl.VerfiyEmail);

router.post('/email-send', authCtrl.emailSend)

router.post("/change-password", authCtrl.changePassword);

module.exports = router;
