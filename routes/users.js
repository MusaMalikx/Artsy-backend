import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import {update} from "../controllers/user.js";
import {getUser} from "../controllers/user.js";

const router = express.Router();

//update user
router.put("/update/:id", verifyToken, update);

//get a user
router.get("/find/:id", getUser);

export default router;