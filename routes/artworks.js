const express = require("express");
const { verifyToken } = require("../utils/verifyToken");
const {
  add,
  checkDuplicate,
  getArtistArtworks,
  getArtworkImage,
  getAllArtworks,
  getAllArtworksByCategory,
  getArtworkArtist,
  getBidInfo,
  getSearchedArtwork,
  updateStatus,
  getBiddersList,
} = require("../controllers/artwork.js");
const { upload } = require("../utils/artworksUpload.js");
const router = express.Router();

//Create Artwork
router.post("/add", verifyToken, upload.array("productImage", 3), add);

//Check Details
router.post("/check", verifyToken, checkDuplicate);

//Get Artworks Artist with name and profile image
router.get("/artist/:artistId", getArtistArtworks);

//Get Artwork Image
router.get("/image", getArtworkImage);

//Get All artworks
router.get("/all", getAllArtworks);

//Get All artworks Filter by category
router.get("/all/category", getAllArtworksByCategory);

//Search Artwork
router.get("/search", getSearchedArtwork);

//Update The status of artwork
router.put("/status/:id", updateStatus);

//Get artwork Artist name
router.get("/madeby", getArtworkArtist);

//Get highest bid information
router.get("/bidinfo/:artId", verifyToken, getBidInfo);

//Get highest bid information
router.get("/bidderlist/:artId", getBiddersList);

module.exports = router;
