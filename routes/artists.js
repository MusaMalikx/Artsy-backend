const express = require("express");
const { verifyToken } = require("../utils/verifyToken");
const { getWalletInfo,addWallet,getArtist,bidProposal } = require("../controllers/artist");

const router = express.Router();

//get an artist
router.get("/find/:id", getArtist);
//Add amount in the wallet
router.post("/wallet/add", verifyToken, addWallet);

//Get details of the buyer's wallet
router.get("/wallet", verifyToken, getWalletInfo);

//Place bid on buyer proposal
router.post(`/proposal/bid/:proposalId`, verifyToken, bidProposal);

//Get all buyer's buyer proposal
router.get(`/proposal`, verifyToken, bidProposal);

module.exports = router;
