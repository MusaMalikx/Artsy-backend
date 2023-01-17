const express = require("express");
const { verifyToken } = require("../utils/verifyToken.js");
const {
  add,
  checkduplicate,
  getallartworks,
  getartworkimage,
} = require("../controllers/artwork.js");
const { upload } = require("../utils/artworksUpload.js");
const router = express.Router();

//Create Artwork
router.post("/add", verifyToken, upload.array("productImage", 3), add);

//Check Details
router.post("/check", verifyToken, checkduplicate);

//Get Artworks
router.get("/artist", verifyToken, getallartworks);

//Get Artwork Image
router.get("/image", getartworkimage);

module.exports = router;
