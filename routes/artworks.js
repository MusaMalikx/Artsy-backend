const express = require("express");
const { verifyToken } = require("../utils/verifyToken.js");
const {
  add,
  checkduplicate,
  getallartworks,
} = require("../controllers/artwork.js");

const router = express.Router();

//Create Artwork
router.post("/add", verifyToken, add);

//Check Details
router.post("/check", verifyToken, checkduplicate);

//Get Artworks
router.get("/all", verifyToken, getallartworks);

module.exports = router;
