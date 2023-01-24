const { createError } = require("../error");

// import createError from "../error";
// import User from "../models/Users";

const User = require("../models/Users");
const Artworks = require("../models/Artwork");
const WalletBuyer = require("../models/WalletBuyer");
const Artist = require("../models/Artist");
const WalletArtist = require("../models/WalletArtist");
const BuyerProposal = require("../models/BuyerProposal");
const update = async (req, res, next) => {
  if (req.params.id === req.user.id) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedUser);
    } catch (err) {
      next(createError(500, "Server Error"));
    }
  } else {
    return next(createError(403, "You can update only your account!"));
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

//Placing a bid on the artwork

const previouslyBid = (BidderList, BidderID) => {
  let flag = false;
  BidderList.forEach((bid) => {
    if (bid.bidderId === BidderID) {
      flag = true;
      return;
    }
  });
  return flag;
};

const placeBid = async (req, res, next) => {
  try {
    const buyer = await User.findOne({ _id: req.user.id });
    //const buyer = await User.findOne({ _id: req.body.userid });
    if (!buyer) return next(createError(404, "Buyer Not logged in!"));
    if (buyer && buyer.isAdmin)
      return next(createError(404, "Admin cannot place a bid!"));
    const artwork = await Artworks.findOne({ _id: req.params.artId });
    const currentbid = parseFloat(artwork.currentbid);
    const basePrice = parseFloat(artwork.baseprice);
    const bid = parseFloat(req.body.bid);
    const oldBid = currentbid;
    if (
      previouslyBid(artwork.bidderList, buyer.id) === true &&
      currentbid < bid &&
      basePrice < bid
    ) {
      await artwork.updateOne({
        $set: {
          bidderList: artwork.bidderList.map((element) => {
            if (element.bidderId === buyer.id) {
              element.bid = bid;
            }
            return element;
          }),
        },
      });
      await artwork.updateOne({
        $set: {
          currentbid: bid,
          currentbidder: buyer.name,
        },
      });
    } else if (currentbid < bid && basePrice < bid) {
      await artwork.updateOne({
        $push: {
          bidderList: {
            bidderId: buyer.id,
            bidderName: buyer.name,
            bid: bid,
            autoBid: {
              status: false,
              maxAmount: 0,
              increment: 0,
            },
          },
        },
      });
      await artwork.updateOne({
        $set: {
          currentbid: bid,
          currentbidder: buyer.name,
        },
      });
    } else {
      return next(createError(405, "Failed to place a bid!"));
    }

    //Update bid of all buyers using automated bid feature
    const updatedArtwork = await Artworks.findOne({ _id: req.params.artId });
    if (oldBid < parseFloat(updatedArtwork.currentbid)) {
      checkAutomatedBid(updatedArtwork);
    }
    res.status(200).json("Succesfully placed a bid");
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

//Initializing an Automated Bidding Feature

const checkAutomatedBid = async (art) => {
  let newBidFlag = true;
  let artwork = art;
  let arworkList = artwork.bidderList;
  while (newBidFlag) {
    newBidFlag = false;
    arworkList.forEach(async (element) => {
      const currentbid = parseFloat(artwork.currentbid);
      const bid = parseFloat(element.bid);
      const maxAmount = parseFloat(element.autoBid.maxAmount);
      const increment = parseFloat(element.autoBid.increment);
      if (
        currentbid > bid &&
        element.autoBid.status == true &&
        maxAmount >= currentbid
      ) {
        if (currentbid + increment >= maxAmount) {
          element.bid = maxAmount;
          element.autoBid = {
            status: false,
            maxAmount: 0,
            increment: 0,
          };
          artwork.currentbid = maxAmount;
          artwork.currentbidder = element.bidderName;
        } else if (currentbid + increment < maxAmount) {
          element.bid = currentbid + increment;
          artwork.currentbid = element.bid;
          artwork.currentbidder = element.bidderName;
        }
        newBidFlag = true;
      } else if (
        currentbid > bid &&
        element.autoBid.status == true &&
        maxAmount < currentbid
      ) {
        element.bid = maxAmount;
        element.autoBid = {
          status: false,
          maxAmount: 0,
          increment: 0,
        };
      }
    });
  }

  await art.updateOne({
    $set: {
      currentbid: artwork.currentbid,
      currentbidder: artwork.currentbidder,
      bidderList: arworkList,
    },
  });
};

const autoBid = async (req, res, next) => {
  let maxAmountErrorFlag = false;
  let oldBid = 0;
  try {
    const buyer = await User.findOne({ _id: req.user.id });
    //const buyer = await User.findOne({ _id: req.body.userid });
    if (!buyer) return next(createError(404, "Buyer Not logged in!"));
    if (buyer && buyer.isAdmin)
      return next(createError(404, "Admin cannot place an automated bid!"));
    const artwork = await Artworks.findOne({ _id: req.params.artId });
    if (!artwork) return next(createError(404, "Invalid Artwork"));
    const currentbid = parseFloat(artwork.currentbid);
    const basePrice = parseFloat(artwork.baseprice);
    let currentExpected = 0;
    const increment = parseFloat(req.body.increment);
    const maxAmount = parseFloat(req.body.maxAmount);
    oldBid = currentbid;
    if (
      previouslyBid(artwork.bidderList, buyer.id) === true &&
      currentbid < maxAmount &&
      basePrice < maxAmount
    ) {
      if (currentbid > basePrice) {
        currentExpected = currentbid + increment;
      } else {
        currentExpected =
          basePrice + increment > maxAmount ? basePrice + increment : maxAmount;
      }
      await artwork.updateOne({
        $set: {
          bidderList: artwork.bidderList.map((element) => {
            if (element.bidderId === buyer.id) {
              if (parseFloat(element.autoBid.maxAmount) < maxAmount) {
                element.bid =
                  currentExpected > maxAmount ? maxAmount : currentExpected;
                element.autoBid = {
                  status: true,
                  maxAmount: maxAmount,
                  increment: increment,
                };
              } else {
                maxAmountErrorFlag = true;
              }
            }
            return element;
          }),
        },
      });
      if (maxAmountErrorFlag) {
        return next(
          createError(
            405,
            "Max amount Should be greater than previous max amount"
          )
        );
      } else {
        await artwork.updateOne({
          $set: {
            currentbidder: buyer.name,
            currentbid:
              currentExpected > maxAmount ? maxAmount : currentExpected,
          },
        });
      }
    } else if (currentbid < maxAmount && basePrice < maxAmount) {
      if (currentbid > basePrice) {
        currentExpected = currentbid + increment;
      } else {
        currentExpected =
          basePrice + increment > maxAmount ? maxAmount : basePrice + increment;
      }
      await artwork.updateOne({
        $push: {
          bidderList: {
            bidderId: buyer.id,
            bidderName: buyer.name,
            bid: currentExpected > maxAmount ? maxAmount : currentExpected,
            autoBid: {
              status: true,
              maxAmount: maxAmount,
              increment: increment,
            },
          },
        },
      });
      await artwork.updateOne({
        $set: {
          currentbidder: buyer.name,
          currentbid: currentExpected > maxAmount ? maxAmount : currentExpected,
        },
      });
    } else {
      return next(createError(405, "Failed to place a bid!"));
    }

    //Update bid of all buyers using automated bid feature
    const updatedArtwork = await Artworks.findOne({ _id: req.params.artId });
    if (oldBid < parseFloat(updatedArtwork.currentbid)) {
      checkAutomatedBid(updatedArtwork);
    }
    res.status(200).json("Succesfully placed a bid");
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

//Add amount in the wallet
const addWallet = async (req, res, next) => {
  try {
    const buyer = await User.findOne({ _id: req.user.id });
    if (!buyer) return next(createError(404, "Buyer not logged in! "));
    const oldWallet = await WalletBuyer.findOne({
      buyerId: req.user.id,
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
      const newWallet = new WalletBuyer({
        Amount: parseFloat(req.body.Amount),
        buyerId: req.user.id,
        Transactions: [],
      });
      await newWallet.save();
      res.status(200).json("Amount added successfully");
    }
  } catch (error) {
    return next(createError(500, "Server Error!"));
  }
};

//perform a transaction to send amount to artist

const sendAmount = async (req, res, next) => {
  try {
    const buyer = await User.findOne({ _id: req.user.id });
    if (!buyer) return next(createError(404, "User not logged in!"));
    const artist = await Artist.findOne({ _id: req.params.artistId });
    if (!artist) return next(createError(404, "Artist does not exist!"));
    const wallet = await WalletBuyer.findOne({
      buyerId: req.user.id,
    });
    if (wallet) {
      if (parseFloat(wallet.Amount) >= parseFloat(req.body.Amount)) {
        //Updating buyer wallet
        await wallet.updateOne({
          $set: {
            ...wallet._doc,
            Amount: parseFloat(wallet.Amount) - parseFloat(req.body.Amount),
            Transactions: [
              ...wallet.Transactions,
              {
                sent: true, //sender
                userName: artist.name,
                Amount: parseFloat(req.body.Amount),
              },
            ],
          },
        });
        //Updating artist wallet
        const artistWallet = await WalletArtist.findOne({
          artistId: req.params.artistId,
        });
        if (artistWallet) {
          //Updating artist wallet
          await artistWallet.updateOne({
            $set: {
              ...artistWallet._doc,
              Amount:
                parseFloat(artistWallet.Amount) + parseFloat(req.body.Amount),
              Transactions: [
                ...artistWallet.Transactions,
                {
                  sent: false, //receiver
                  userName: buyer.name,
                  Amount: parseFloat(req.body.Amount),
                },
              ],
            },
          });
        } //create a wallet for artist
        else {
          const newArtistWallet = new WalletArtist({
            Amount: parseFloat(req.body.Amount),
            artistId: req.params.artistId,
            Transactions: [
              {
                sent: false, //receiver
                userName: buyer.name,
                Amount: parseFloat(req.body.Amount),
              },
            ],
          });
          await newArtistWallet.save();
        }
        res.status(200).json("Successfully sent the amount!");
      } else return next(createError(402, "Insufficient amount in wallet"));
    } else return next(createError(403, "Wallet does exist!"));
  } catch (error) {
    return next(createError(500, "Server Error!"));
  }
};

//Get info of the buyer's wallet
const getWalletInfo = async (req, res, next) => {
  try {
    const buyer = await User.findOne({ _id: req.user.id });
    if (!buyer) return next(createError(404, "User not logged in!"));
    const wallet = await WalletBuyer.findOne({
      buyerId: req.user.id,
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

//Get list of all artworks where buyer has placed the bid

const getBidList = async (req, res, next) => {
  try {
    const buyer = await User.findOne({
      _id: req.params.buyerId,
    });
    if (!buyer) return next(createError(404, "Buyer not found!"));
    const artworks = await Artworks.find();
    if (artworks.length > 0) {
      const bidList = artworks.map((art) => {
        let flag = false;
        let myBid = {};
        art.bidderList.forEach((bid) => {
          if (bid.bidderId === req.params.buyerId) {
            flag = true;
            myBid = bid;
            return;
          }
        });
        const { bidderList, ...remaining } = art._doc;
        if (flag)
          return {
            ...remaining,
            myBid,
          };
      });
      res.status(200).json(bidList.filter((e) => e != null));
    } else {
      return next(createError(403, "Not artwork found!"));
    }
  } catch (error) {
    return next(createError(500, "Server Error"));
  }
};

//Create a new on demand proposal for buyer

const createNewProposal = async (req, res, next) => {
  try {
    const buyer = await User.findOne({
      _id: req.user.id,
    });
    if (!buyer) return next(createError(404, "User not logged in"));
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    let today = new Date().toLocaleDateString("en-US", options);
    const newProposal = new BuyerProposal({
      buyerId: req.user.id,
      ...req.body,
      dateCreated: today,
    });
    await newProposal.save();
    res.status(200).json("New proposal created successfully!");
  } catch (error) {
    return next(createError(500, "Server Error"));
  }
};

module.exports = {
  update,
  getUser,
  placeBid,
  autoBid,
  addWallet,
  sendAmount,
  getWalletInfo,
  getBidList,
  createNewProposal,
};
