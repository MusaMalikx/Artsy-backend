import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import { add } from "../controllers/artwork.js";


const router = express.Router();

//Create Artwork
router.post("/add", verifyToken , add);


export default router;