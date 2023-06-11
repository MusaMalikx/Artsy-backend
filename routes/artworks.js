const express = require("express");
const { verifyToken } = require("../utils/verifyToken");
const {
  getArtwork,
  deleteArtwork,
  add,
  getCountArtworksStaus,
  checkDuplicate,
  getArtistArtworks,
  getArtworkImage,
  getAllArtworks,
  getAllArtworksHome,
  getAllArtworksByCategory,
  getArtworkArtist,
  getBidInfo,
  getSearchedArtwork,
  updateStatus,
  getBiddersList,
  getArtistListedArtworks,
  getRecommendation
} = require("../controllers/artwork.js");
const { upload } = require("../utils/artworksUpload.js");
const router = express.Router();

//get an Artwork
router.get("/artwork/:id", getArtwork);

//Delete an Artwork
router.delete("/artwork/delete/:id", verifyToken, deleteArtwork);

//Create Artwork
router.post("/add", verifyToken, upload.array("productImage", 9), add);
//router.post("/add", verifyToken, add);

//Check Details
router.post("/check", verifyToken, checkDuplicate);

//Get Artworks Artist with name and profile image
router.get("/artist/:artistId", getArtistArtworks);

//Get Count of closed artworks
router.get("/artist/status/:artistId", getCountArtworksStaus);

//Get Artwork Image
router.get("/image", getArtworkImage);

//Get All artworks
router.get("/all", getAllArtworks);  

//Get All for Home page
router.get("/all/home", getAllArtworksHome);

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

//Get All Listed Artworks by Artist
router.get("/artistlist", verifyToken, getArtistListedArtworks);

//Get All Listed Artworks by Artist
router.get("/recommend", getRecommendation);

module.exports = router;
