import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { add, checkduplicate, getallartworks } from "../controllers/artwork.js";


const router = express.Router();

//Create Artwork
router.post("/add", verifyToken , add);

//Check Details
router.post("/check" , verifyToken , checkduplicate)

//Get Artworks
router.get("/all", verifyToken , getallartworks)


export default router;