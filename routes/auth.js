const express = require("express");
const {
  signinUser,
  signinUserTest,
  signupUser,
  logout,
  googleAuthUser,
  signupArtist,
  signinArtist,
  googleAuthArtist,
  signinAdmin,
  signupAdmin,
  checkDetailsArtist,
  checkDetailsUser,
  checkDetailsAdmin,
  googleSignupAdmin,
  googleSigninAdmin,
  signinArtistTest,
  signinAdminTest,
} = require("../controllers/auth.js");

const router = express.Router();

//CREATE A USER
router.post("/user/signup", signupUser);

//SIGN IN
router.post("/user/signin", signinUser);

//TEST SIGN IN
router.post("/user/signin-test", signinUserTest);

//GOOGLE AUTH
router.post("/user/google", googleAuthUser);

//Create a Artist
router.post("/artist/signup", signupArtist);

//Signin Artist
router.post("/artist/signin", signinArtist);

//Test Artist
router.post("/artist/signin-test", signinArtistTest);

//Artist Google Auth
router.post("/artist/google", googleAuthArtist);

//Signin Admin
router.post("/admin/signin", signinAdmin);

//Signin Admin Test
router.post("/admin/signin-test", signinAdminTest);

//Signup Admin
router.post("/admin/signup", signupAdmin);

//Signup Admin using Google
router.post("/admin/google/signup", googleSignupAdmin);

//SignIn Admin using Google
router.post("/admin/google/signin", googleSigninAdmin);

//Logout
router.get("/logout", logout);

//Check number and cnic
router.post("/artist/check", checkDetailsArtist);

//Check number and cnic for User
router.post("/user/check", checkDetailsUser);

//Check number , cnic and admin code for admin
router.post("/admin/check", checkDetailsAdmin);

module.exports = router;
