const express = require("express");
const {
  signinUser,
  signupUser,
  logout,
  googleAuthUser,
  signupArtist,
  signinArtist,
  googleAuthArtist,
  signinAdmin,
  checkDetailsArtist,
  checkDetailsUser,
} = require("../controllers/auth");

const router = express.Router();

//CREATE A USER
router.post("/user/signup", signupUser);

//SIGN IN
router.post("/user/signin", signinUser);

//GOOGLE AUTH
router.post("/user/google", googleAuthUser);

//Create a Artist
router.post("/artist/signup", signupArtist);

//Signin Artist
router.post("/artist/signin", signinArtist);

//Artist Google Auth
router.post("/artist/google", googleAuthArtist);

//Signin Admin
router.post("/admin/signin", signinAdmin);

//Logout
router.get("/logout", logout);

//Check number and cnic
router.post("/artist/check", checkDetailsArtist);

//Check number and cnic for User
router.post("/user/check", checkDetailsUser);

module.exports = router;
