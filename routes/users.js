const express = require("express");
const { verifyToken } = require("../utils/verifyToken.js");
const {
  update,
  getUser,
  placeBid,
  autoBid,
} = require("../controllers/user.js");

const router = express.Router();

//update user
router.put("/update/:id", verifyToken, update);

//get a user
router.get("/find/:id", getUser);

//Place a bid on an Artwork
router.post("/bid/:artId", verifyToken, placeBid);

//Initalize an automated bid on an Artwork
router.post("/autobid/:artId", verifyToken, autoBid);

module.exports = router;
