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


module.exports = router;
