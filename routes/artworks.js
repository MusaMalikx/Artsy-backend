const express = require("express");
const { verifyToken } = require("../utils/verifyToken.js");
const {
  add,
  checkduplicate,
  getartistartworks,
  getartworkimage,
  getallartworks,
  getartworkartist,
} = require("../controllers/artwork.js");
const { upload } = require("../utils/artworksUpload.js");
const router = express.Router();

//Create Artwork
router.post("/add", verifyToken, upload.array("productImage", 3), add);

//Check Details
router.post("/check", verifyToken, checkduplicate);

//Get Artworks Artist
router.get("/artist", verifyToken, getartistartworks);

//Get Artwork Image
router.get("/image", getartworkimage);

//Get All artworks
router.get("/all", getallartworks);

//Get artwork Artist name
router.get("/madeby", getartworkartist);

module.exports = router;
