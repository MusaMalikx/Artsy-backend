import express from "express";
import { signinUser, signupUser ,logout, googleAuthUser, signupArtist , signinArtist, googleAuthArtist , signinAdmin} from "../controllers/auth.js";

const router = express.Router();


//CREATE A USER
router.post("/user/signup", signupUser);

//SIGN IN
router.post("/user/signin", signinUser);

//GOOGLE AUTH
router.post("/user/google", googleAuthUser);

//Create a Artist
router.post("/artist/signup" , signupArtist);

//Signin Artist
router.post("/artist/signin", signinArtist);

//Artist Google Auth
router.post("/artist/google", googleAuthArtist);

//Signin Admin 
router.post("/admin/signin" , signinAdmin);



//Logout
router.get("/logout", logout);



export default router;