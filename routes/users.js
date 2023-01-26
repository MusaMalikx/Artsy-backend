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
  releaseCentralPayment,
  getAcceptedProposalList,
  deleteAcceptedProposal,
} = require("../controllers/user");

const router = express.Router();

//update user
router.put("/update/:id", verifyToken, update);

//get a user
router.get("/find/:id", getUser);

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

//Release Central Payment
router.get("/payment/release/:proposalId", verifyToken, releaseCentralPayment);

//Get Accepted Proposal List
router.get("/proposal/accepted", verifyToken, getAcceptedProposalList);

//Get Accepted Proposal List
router.post(`/proposal/accepted/delete`, verifyToken, deleteAcceptedProposal);

module.exports = router;
