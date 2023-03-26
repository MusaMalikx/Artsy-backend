const express = require("express");
const { verifyToken } = require("../utils/verifyToken");
const {
  update,
  getUser,
  placeBid,
  autoBid,
  addWallet,
  sendAmount,
  getWalletInfo,
  getBidList,
  createNewProposal,
  getProposals,
  deleteProposals,
  getArtistProposalBids,
  acceptProposal,
  releaseCentralPaymentProposal,
  getAcceptedProposalList,
  deleteAcceptedProposal,
  getAllUsers,
  getWonArtworks,
  claimArtwork,
  releaseCentralPaymentArtwork,
  giveRating,
  deleteUser,
  reportArtist,
  getAllCount,
} = require("../controllers/user");

const router = express.Router();

//update user
router.put("/update/:id", verifyToken, update);

//get a user
router.get("/find/:id", getUser);

//get all user
router.get("/", getAllUsers);

//get total count
router.get("/count", getAllCount);

//Place a bid on an Artwork
router.post("/bid/:artId", verifyToken, placeBid);

//Initalize an automated bid on an Artwork
router.post("/autobid/:artId", verifyToken, autoBid);

//Add amount in the wallet
router.post("/wallet/add", verifyToken, addWallet);

//Perform a transaction to send amount to artist
router.post("/wallet/send/:artistId", verifyToken, sendAmount);

//Get details of the buyer's wallet
router.get("/wallet", verifyToken, getWalletInfo);

//Get list of all artworks on which the buyer has placed the bid
router.get("/bid/list/:buyerId", getBidList);

//Create a new on demand proposal for buyer
router.post("/proposal/create", verifyToken, createNewProposal);

//Get all the created proposals
router.get("/proposal", verifyToken, getProposals);

//Delete previously created proposals
router.post("/proposal/delete", verifyToken, deleteProposals);

//Get all the proposal bids by artists on the buyer proposal
router.get("/proposal/artistbid/:proposalId", getArtistProposalBids);

//Accept a artist proposal for a on-demand artwork
router.post("/proposal/accept/:proposalId", verifyToken, acceptProposal);

//Release Central Payment for Proposal
router.get(
  "/payment/release/:proposalId",
  verifyToken,
  releaseCentralPaymentProposal
);

//Get Accepted Proposal List
router.get("/proposal/accepted", verifyToken, getAcceptedProposalList);

//Get Accepted Proposal List
router.post(`/proposal/accepted/delete`, verifyToken, deleteAcceptedProposal);

//get all artworks won by the buyer
router.get(`/find/artworks/won/:buyerId`, getWonArtworks);

//Claim artwork won in an auction
router.post(`/artworks/claim/:artworkId`, verifyToken, claimArtwork);

//Release Central Payment for Artwork
router.get(
  "/payment/release/artwork/:artworkId",
  verifyToken,
  releaseCentralPaymentArtwork
);

//Give Rating
router.post(`/rate/artist/:artistId`, verifyToken, giveRating);

//Report a Artist
router.post("/report/artist", verifyToken, reportArtist);

//Delete an Artist
router.delete("/:id", deleteUser);

module.exports = router;
