const express = require("express");
const { verifyToken } = require("../utils/verifyToken.js");
const { update } = require("../controllers/user.js");
const { getUser } = require("../controllers/user.js");

const router = express.Router();

//update user
router.put("/update/:id", verifyToken, update);

//get a user
router.get("/find/:id", getUser);

module.exports = router;
