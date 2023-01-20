const express = require("express");
const { verifyToken } = require("../utils/verifyToken.js");
const {
  add,
  checkDuplicate,
  getArtistArtworks,
  getArtworkImage,
  getAllArtworks,
  getArtworkArtist,
} = require("../controllers/artwork.js");
const { upload } = require("../utils/artworksUpload.js");
const router = express.Router();

//Create Artwork
router.post("/add", verifyToken, upload.array("productImage", 3), add);

//Check Details
router.post("/check", verifyToken, checkDuplicate);

//Get Artworks Artist
router.get("/artist", verifyToken, getArtistArtworks);

//Get Artwork Image
router.get("/image", getArtworkImage);

//Get All artworks
router.get("/all", getAllArtworks);

//Get artwork Artist name
router.get("/madeby", getArtworkArtist);

module.exports = router;
