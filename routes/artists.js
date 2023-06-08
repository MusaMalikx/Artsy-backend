const express = require("express");
const { verifyToken } = require("../utils/verifyToken");
const {
  getWalletInfo,
  addWallet,
  getArtist,
  bidProposal,
  newProposals,
  getAllArtists,
  getAllRatings,
  getRatingAverage,
  getAcceptedProposals,
  reportBuyer,
  deleteArtist,
  updateInfo,
  warnArtist,
  unbanArtist,
} = require("../controllers/artist");

const router = express.Router();

//Unban artist
router.put("/unban/:id", verifyToken, unbanArtist);

//warn an artist
router.put("/warn/:id", warnArtist);

//get an artist
router.get("/find/:id", getArtist);

//get all artists
router.get("/", getAllArtists);

//Add amount in the wallet
router.post("/wallet/add", verifyToken, addWallet);

//Get details of the buyer's wallet
router.get("/wallet", verifyToken, getWalletInfo);

//Place bid on buyer proposal
router.post(`/proposal/bid/:proposalId`, verifyToken, bidProposal);

//Get all the new buyers proposal where artist has not placed a bid
router.get(`/proposal`, verifyToken, newProposals);

//Get Accepted bids on Proposals
router.get("/proposal/accepted", verifyToken, getAcceptedProposals);

//Get all ratings given by buyers
router.get(`/rating/:artistId`, getAllRatings);

//Get average and total number of ratings
router.get(`/rating/average/:artistId`, getRatingAverage);

//Report a buyer
router.post("/report/buyer", verifyToken, reportBuyer);

//Delete an Artist
router.delete("/:id", deleteArtist);

//Update Information of an artist
router.post("/update/info", verifyToken, updateInfo);

module.exports = router;
