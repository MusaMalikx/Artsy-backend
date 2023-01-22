const { createError } = require("../error");
const Artist = require("../models/Artist");
const WalletArtist = require("../models/WalletArtist");

//Add amount in the wallet
const addWallet = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ _id: req.user.id });
    if (!artist) return next(createError(404, "Artist not logged in! "));
    const oldWallet = await WalletArtist.findOne({
      artistId: req.user.id,
    });
    if (oldWallet) {
      await oldWallet.updateOne({
        $set: {
          ...oldWallet._doc,
          Amount: parseFloat(req.body.Amount) + oldWallet.Amount,
        },
      });
      res.status(200).json("Amount added successfully");
    } else {
      const newWallet = new WalletArtist({
        Amount: parseFloat(req.body.Amount),
        artistId: req.user.id,
        Transactions: [],
      });
      await newWallet.save();
      res.status(200).json("Amount added successfully");
    }
  } catch (error) {
    return next(createError(500, "Server Error!"));
  }
};

//Get info of the artist's wallet
const getWalletInfo = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ _id: req.user.id });
    if (!artist) return next(createError(404, "Artist not logged in!"));
    const wallet = await WalletArtist.findOne({
      artistId: req.user.id,
    });
    if (!wallet) {
      res.status(200).json({
        Amount: 0,
        Transactions: [],
      });
    } else {
      res.status(200).json({
        Amount: wallet.Amount,
        Transactions: wallet.Transactions,
      });
    }
  } catch (error) {
    return next(createError(500, "Server Error!"));
  }
};

//Get an artist
const getArtist = async (req, res, next) => {
  try {
    const artist = await Artist.findById(req.params.id);
    res.status(200).json(artist);
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

module.exports = {
  getWalletInfo,
  addWallet,
  getArtist,
};
