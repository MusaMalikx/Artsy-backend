const express = require("express");
const { verifyToken } = require("../utils/verifyToken");
const { update, getUser, getAllUser } = require("../controllers/user");

const router = express.Router();

//update user
router.put("/update/:id", verifyToken, update);

//get a user
router.get("/find/:id", getUser);

//get all user
router.get("/", getAllUser);

module.exports = router;
