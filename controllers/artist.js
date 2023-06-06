const { createError } = require("../error");
const AcceptedProposal = require("../models/AcceptedProposal");
const Artist = require("../models/Artist");
const BuyerProposal = require("../models/BuyerProposal");
const Users = require("../models/Users");
const WalletArtist = require("../models/WalletArtist");
const Reports = require("../models/Reports");
const { default: mongoose } = require("mongoose");

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

//Get all artist
const getAllArtists = async (req, res, next) => {
  try {
    const artists = await Artist.find({});
    res.status(200).json(artists);
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

//Place bid on buyer proposal

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
            artistImage: artist.imageURL,
            artistName: artist.name,
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
    // const newProposals = buyerProposal.map((proposal) => {
    //   let flag = false;
    //   proposal.artistProposals.forEach((artistBid) => {
    //     if (artistBid.artistId === req.user.id) {
    //       flag = true;
    //       return;
    //     }
    //   });
    //   if (flag) return null;
    //   return proposal;
    // });
    // res.status(200).json(newProposals.filter((prop) => prop != null));
    res.status(200).json(buyerProposal);
  } catch (err) {
    return next(createError(500, "Server Error"));
  }
};

//Get all Artists approved bids on Proposals
const getAcceptedProposals = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ _id: req.user.id });
    if (!artist) return next(createError(404, "Artist not logged in"));
    AcceptedProposal.find({
      "artistInfo.artistId": mongoose.Types.ObjectId(req.user.id),
    })
      .populate("buyerId", "name")
      .exec((err, proposals) => {
        if (err) {
          return next(createError(500, err));
        }
        return res.status(200).json(proposals);
      });
  } catch (err) {
    return next(createError(500, "Server Error"));
  }
};

//Get Ratings given by buyers

const getAllRatings = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ _id: req.params.artistId });
    if (!artist) return next(createError(404, "Artist not logged in"));
    const ratingList = [];
    // console.log(artist.rating);
    for (let i = 0; i < artist.rating.length; i++) {
      const buyer = await Users.findOne({
        _id: artist.rating[i].buyerId,
      });
      ratingList.push({
        ...artist.rating[i],
        buyerName: buyer.name,
        buyerPicture: buyer.imageURL,
      });
    }
    res.status(200).json(ratingList);
  } catch (error) {
    return next(createError(500, "Server Error"));
  }
};

//Get total count and average of ratings
const getRatingAverage = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ _id: req.params.artistId });
    if (!artist) return next(createError(404, "Artist not logged in"));
    let totalRatings = 0;
    let sum = 0;
    for (let i = 0; i < artist.rating.length; i++) {
      sum += parseInt(artist.rating[i].ratedValue);
      totalRatings++;
    }
    res.status(200).json({
      totalRatings: totalRatings,
      averageRating: Math.floor(sum / totalRatings)
        ? Math.floor(sum / totalRatings)
        : 0,
    });
  } catch (error) {
    return next(createError(500, "Server Error"));
  }
};

const deleteArtist = async (req, res, next) => {
  try {
    await Artist.findByIdAndDelete(req.params.id);
    res.status(200).json("Artist has been deleted!");
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

//update personal information of artist
const updateInfo = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ _id: req.user.id });
    if (!artist) return next(createError(404, "Artist not logged in"));
    await artist.updateOne({
      $set: {
        ...req.body,
      },
    });
    res.status(200).json("Artist Information Updated Succesfully");
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const reportBuyer = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({
      _id: req.user.id,
    });
    if (!artist) return next(createError(404, "Artist not logged In"));

    const buyer = await Users.findOne({ _id: req.body.buyerid });
    if (!buyer) return next(createError(404, "Buyer not found!"));

    const report = await Reports.findOne({
      "buyer.id": buyer._id,
      "artist.id": artist._id,
      reportType: "buyer",
    });

    if (report) return next(createError(400, "Already Reported"));
    //complete from here
    const newReport = new Reports({
      reportType: "buyer",
      artist: {
        id: artist._id,
        name: artist.name,
      },
      buyer: {
        id: buyer._id,
        name: buyer.name,
      },
      category: req.body.category,
      description: req.body.description,
    });

    await newReport.save();

    res.status(200).json("Report succesfully placed!");
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

module.exports = {
  getWalletInfo,
  addWallet,
  getArtist,
  getAllArtists,
  bidProposal,
  newProposals,
  getAllRatings,
  getRatingAverage,
  getAcceptedProposals,
  deleteArtist,
  updateInfo,
  reportBuyer,
};
