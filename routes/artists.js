const express = require("express");
const { verifyToken } = require("../utils/verifyToken");
const { getWalletInfo,addWallet } = require("../controllers/artist");

const router = express.Router();


//Add amount in the wallet
router.post("/wallet/add", verifyToken, addWallet);

//Get details of the buyer's wallet
router.get("/wallet", verifyToken, getWalletInfo);

module.exports = router;
