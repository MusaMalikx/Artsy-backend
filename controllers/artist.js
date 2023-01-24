const { createError } = require("../error");
const Artist = require("../models/Artist");
const BuyerProposal = require("../models/BuyerProposal");
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
    return next(createError(500, "Server Error"));
  }
};

//Place bid on buyer prosal

const bidProposal = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ _id: req.user.id });
    if (!artist) return next(createError(404, "Artist not logged in"));
    const buyerProposal = await BuyerProposal.findOne({
      _id: req.params.proposalId,
    });

    if (!buyerProposal) return next(createError(403, "Proposal not found!"));
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    let today = new Date().toLocaleDateString("en-US", options);
    await buyerProposal.updateOne({
      $set: {
        artistProposals: [
          ...buyerProposal.artistProposals,
          {
            artistId: req.user.id,
            bidDate: today,
            ...req.body,
          },
        ],
      },
    });
    res.status(200).json("Succesfully placed a bid");
  } catch (err) {
    return next(createError(500, "Server Error"));
  }
};

//Get all the new buyers proposal where artist has not placed a bid

const newProposals = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ _id: req.user.id });
    if (!artist) return next(createError(404, "Artist not logged in"));
    const buyerProposal = await BuyerProposal.find();
    if (!buyerProposal) return next(createError(403, "Proposals not found!"));
    const newProposals = buyerProposal.map((proposal) => {
      let flag = false;
      proposal.artistProposals.forEach((artistBid) => {
        if (artistBid.artistId === req.user.id) {
          flag = true;
          return;
        }
      });
      if (flag) return null;
      return proposal;
    });

    res.status(200).json(newProposals.filter((prop) => prop != null));
  } catch (err) {
    return next(createError(500, "Server Error"));
  }
};

module.exports = {
  getWalletInfo,
  addWallet,
  getArtist,
  bidProposal,
  newProposals,
};
