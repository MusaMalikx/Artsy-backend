const { createError } = require("../error");

// import createError from "../error";
// import User from "../models/Users";

const User = require("../models/Users");
const Artworks = require("../models/Artwork");
const WalletBuyer = require("../models/WalletBuyer");
const Artist = require("../models/Artist");
const WalletArtist = require("../models/WalletArtist");
const BuyerProposal = require("../models/BuyerProposal");
const AcceptedProposal = require("../models/AcceptedProposal");
const CentralBank = require("../models/CentralBank");
const WonArtwork = require("../models/WonArtwork");
const Users = require("../models/Users");
const Artwork = require("../models/Artwork");
const Reports = require("../models/Reports");
const { default: mongoose } = require("mongoose");

//Unban User
const unbanUser = async (req, res, next) => {
  try {
    //Frontend pai headers mai token = "Bearer token"
    const admin = await Users.findOne({ isAdmin: true, _id: req.user.id });
    if (!admin) return next(createError(401, "Admin Not signedIn!"));

    const userId = req.params.id;
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Buyer not found" });
    }

    if (user.warnings < 3) {
      return res.status(400).json({ error: "Buyer Already Active" });
    }

    user.warnings -= 1;
    await user.save();

    res.status(200).json(user.name);
  } catch (err) {
    return next(createError(500, "Server Error!"));
  }
};

//Warn User
const warnUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Buyer not found" });
    }

    if (user.warnings >= 3) {
      return res.status(400).json({ error: "Buyer Already Banned!" });
    }

    user.warnings += 1;
    await user.save();

    res.status(200).json(user.name);
  } catch (err) {
    return next(createError(500, "Server Error!"));
  }
};

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

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const getAllCount = async (req, res, next) => {
  try {
    const users = await User.find({ isAdmin: false });
    const admins = await User.find({ isAdmin: true });
    const artists = await Artist.find({});
    const artworks = await Artwork.find({});
    const liveArtworks = await Artwork.countDocuments({ status: "live" });
    const closedArtworks = await Artwork.countDocuments({ status: "closed" });
    const comingSoonArtworks = await Artwork.countDocuments({
      status: "comming soon",
    });
    const reports = await Reports.countDocuments();
    const buyerProposals = await BuyerProposal.countDocuments();
    const acceptedProposals = await AcceptedProposal.countDocuments();
    const wonArtworks = await WonArtwork.countDocuments();
    const claimWonArtworks = await WonArtwork.countDocuments({
      status: "claim",
    });
    const paidWonArtworks = await WonArtwork.countDocuments({ status: "paid" });
    const pendingWonArtworks = await WonArtwork.countDocuments({
      status: "pending",
    });

    res.status(200).json({
      users: users.length,
      admins: admins.length,
      artists: artists.length,
      artworks: artworks.length,
      liveArtworks: liveArtworks,
      closedArtworks: closedArtworks,
      comingSoonArtworks: comingSoonArtworks,
      reports: reports,
      buyerProposals,
      acceptedProposals,
      notAcceptedProposals: buyerProposals - acceptedProposals,
      wonArtworks,
      claimWonArtworks,
      paidWonArtworks,
      pendingWonArtworks,
    });
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
            bidderFid: buyer.firebaseid,
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
            bidderFid: buyer.firebaseid,
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
      buyerInfo: {
        buyerId: req.user.id,
        name: buyer.name,
        image: buyer.imageURL,
      },
      ...req.body,
      dateCreated: today,
    });
    await newProposal.save();
    res.status(200).json("New proposal created successfully!");
  } catch (error) {
    return next(createError(500, "Server Error"));
  }
};

//Get all the proposals created by a buyer
const getProposals = async (req, res, next) => {
  try {
    const buyer = await User.findOne({ _id: req.user.id });
    if (!buyer) return next(createError(404, "Buyer not logged in"));
    const buyerProposal = await BuyerProposal.find();
    if (!buyerProposal) return next(createError(403, "Proposals not found!"));
    res
      .status(200)
      .json(
        buyerProposal.filter((prop) => prop.buyerInfo.buyerId === req.user.id)
      );
  } catch (err) {
    return next(createError(500, "Server Error"));
  }
};

//Delete previously created proposals
const deleteProposals = async (req, res, next) => {
  try {
    const buyer = await User.findOne({ _id: req.user.id });
    if (!buyer) return next(createError(404, "Buyer not logged in"));
    const proposalList = req.body.proposalList;
    proposalList.forEach(async (pId) => {
      await BuyerProposal.deleteOne({ _id: pId });
    });
    res.status(200).json("Successfully deleted!");
  } catch (err) {
    return next(createError(500, "Server Error"));
  }
};

//Get all the proposal bids by artists on the buyer proposal
const getArtistProposalBids = async (req, res, next) => {
  try {
    console.log(req.params.proposalId);
    const proposal = await BuyerProposal.findOne({
      _id: req.params.proposalId,
    });
    if (!proposal) return next(createError(404, "Proposal not found!"));
    res.status(200).json(proposal.artistProposals);
  } catch (err) {
    return next(createError(500, "Server Error"));
  }
};

//Accept a artist proposal for a on-demand artwork
const acceptProposal = async (req, res, next) => {
  try {
    const buyer = await User.findOne({ _id: req.user.id });
    if (!buyer) return next(createError(404, "Buyer not logged in"));
    const artist = await Artist.findOne({ _id: req.body.artistInfo.artistId });
    if (!artist) return next(createError(404, "Artist does not exist!"));
    const proposal = await BuyerProposal.findOne({
      _id: req.params.proposalId,
    });
    if (!proposal) return next(createError(403, "Proposal not found!"));
    const wallet = await WalletBuyer.findOne({
      buyerId: req.user.id,
    });
    if (!wallet) return next(createError(402, "Not Enough credits in wallet!"));
    if (wallet.Amount < parseFloat(req.body.acceptedAmount))
      return next(createError(402, "Not Enough credits in wallet!"));
    const info = {
      buyerId: req.user.id,
      proposalId: req.params.proposalId,
      title: proposal.title,
      description: proposal.description,
      dateCreated: proposal.dateCreated,
      ...req.body,
      artistInfo: {
        artistId: mongoose.Types.ObjectId(req.body.artistInfo.artistId),
        artistName: req.body.artistInfo.artistName,
      },
    };
    const acceptProposal = new AcceptedProposal(info);
    const savedProposal = await acceptProposal.save();
    if (savedProposal) {
      const bankInfo = {
        sender: {
          type: "Buyer",
          _id: req.user.id,
          fid: buyer.firebaseid,
        },
        proposalId: req.params.proposalId,
        amount: parseFloat(req.body.acceptedAmount),
        receiver: {
          type: "Artist",
          _id: artist._id,
          fid: artist.firebaseid,
        },
      };
      const centralStoreBank = new CentralBank(bankInfo);
      const savedBankInfo = await centralStoreBank.save();
      if (savedBankInfo) {
        const updastedWallet = await wallet.updateOne({
          $set: {
            Amount: wallet.Amount - parseFloat(req.body.acceptedAmount),
          },
        });
        if (updastedWallet.modifiedCount > 0) {
          await proposal.deleteOne();
          res.status(200).json("Succesfully accepted the wallet");
        }
      }
    }
  } catch (error) {
    return next(createError(500, "Server Error"));
  }
};

//Release Central Payment for Proposal
const releaseCentralPaymentProposal = async (req, res, next) => {
  try {
    const buyer = await User.findOne({
      _id: req.user.id,
    });
    if (!buyer) return next(createError(404, "User not logged in"));
    const payment = await CentralBank.findOne({
      proposalId: req.params.proposalId,
    });
    if (!payment) return next(createError(403, "Invalid Proposal!"));
    const acceptedProposal = await AcceptedProposal.findOne({
      proposalId: req.params.proposalId,
    });
    if (!acceptedProposal) return next(createError(403, "Invalid Proposal!"));
    if (payment.sender._id !== req.user.id)
      return next(createError(402, "Unauthorized to release payment!"));
    const artist = await Artist.findOne({
      _id: payment.receiver._id,
    });
    if (!artist) return next(createError(403, "Invalid Receiver!"));
    const wallet = await WalletBuyer.findOne({ buyerId: req.user.id });
    if (wallet) {
      //Updating buyer wallet
      await wallet.updateOne({
        $set: {
          ...wallet._doc,
          Transactions: [
            ...wallet.Transactions,
            {
              sent: true, //sender
              userName: artist.name,
              Amount: parseFloat(payment.amount),
            },
          ],
        },
      });
      //Updating artist wallet
      const artistWallet = await WalletArtist.findOne({
        artistId: artist._id,
      });
      if (artistWallet) {
        //Updating artist wallet
        await artistWallet.updateOne({
          $set: {
            ...artistWallet._doc,
            Amount:
              parseFloat(artistWallet.Amount) + parseFloat(payment.amount),
            Transactions: [
              ...artistWallet.Transactions,
              {
                sent: false, //receiver
                userName: buyer.name,
                Amount: parseFloat(payment.amount),
              },
            ],
          },
        });
      } //create a wallet for artist
      else {
        const newArtistWallet = new WalletArtist({
          Amount: parseFloat(payment.amount),
          artistId: artist._id,
          Transactions: [
            {
              sent: false, //receiver
              userName: buyer.name,
              Amount: parseFloat(payment.amount),
            },
          ],
        });
        await newArtistWallet.save();
      }
      const transactionInfo = {
        sender: {
          name: buyer.name,
          fid: payment.sender.fid,
        },
        receiver: {
          name: artist.name,
          fid: payment.receiver.fid,
        },
        amount: payment.amount,
      };
      await payment.deleteOne();
      await acceptedProposal.updateOne({
        paid: true,
      });
      res.status(200).json(transactionInfo);
    } else return next(createError(403, "Wallet does exist!"));
  } catch (error) {
    return next(createError(500, "Server Error"));
  }
};

//Get Accepted Proposal List
const getAcceptedProposalList = async (req, res, next) => {
  try {
    const buyer = await User.findOne({ _id: req.user.id });
    if (!buyer) return next(createError(404, "Buyer not logged in"));
    const acceptedProposals = await AcceptedProposal.find({
      buyerId: req.user.id,
    });
    if (!acceptedProposals)
      return next(createError(403, "Proposals not found!"));
    res.status(200).json(acceptedProposals);
  } catch (err) {
    return next(createError(500, "Server Error"));
  }
};

//Get Accepted Proposal List
const deleteAcceptedProposal = async (req, res, next) => {
  try {
    const buyer = await User.findOne({ _id: req.user.id });
    if (!buyer) return next(createError(404, "Buyer not logged in"));
    const proposalList = req.body.proposalList;
    proposalList.forEach(async (pId) => {
      await AcceptedProposal.deleteOne({ _id: pId });
    });
    res.status(200).json("Successfully deleted!");
  } catch (err) {
    return next(createError(500, "Server Error"));
  }
};

//get all artworks won by the buyer
const getWonArtworks = async (req, res, next) => {
  try {
    const buyer = await User.findOne({ _id: req.params.buyerId });
    if (!buyer) return next(createError(404, "Buyer not logged in"));
    const wonArtworks = await WonArtwork.find({
      buyerId: buyer._id,
    });

    const artworksList = [];
    for (let i = 0; i < wonArtworks.length; i++) {
      const artwork = await Artworks.findOne({
        _id: wonArtworks[i].artworkId,
      });
      const artist = await Artist.findOne({
        _id: artwork.artistId,
      });
      artworksList.push({
        paymentStatus: wonArtworks[i].status,
        artistFid: artist.firebaseid,
        ...artwork._doc,
      });
    }
    res.status(200).json(artworksList);
  } catch (err) {
    next(createError(500, err.message));
  }
};

//Claim artwork won in an auction
const claimArtwork = async (req, res, next) => {
  try {
    const buyer = await User.findOne({ _id: req.user.id });
    if (!buyer) return next(createError(404, "Buyer not logged in"));
    const artist = await Artist.findOne({ _id: req.body.artistId });
    if (!artist) return next(createError(404, "Artist does not exist!"));
    const artwork = await WonArtwork.findOne({
      artworkId: req.params.artworkId,
    });
    if (!artwork) return next(createError(403, "Artwork not found!"));
    const wallet = await WalletBuyer.findOne({
      buyerId: req.user.id,
    });
    if (!wallet) return next(createError(402, "Not Enough credits in wallet!"));
    if (wallet.Amount < parseFloat(req.body.acceptedAmount))
      return next(createError(402, "Not Enough credits in wallet!"));

    const updatedArtwork = await artwork.update({
      $set: {
        status: "payment",
      },
    });

    if (updatedArtwork) {
      const bankInfo = {
        sender: {
          type: "Buyer",
          _id: req.user.id,
          fid: buyer.firebaseid,
        },
        amount: parseFloat(req.body.acceptedAmount),
        proposalId: artwork.artworkId,
        receiver: {
          type: "Artist",
          _id: artist._id,
          fid: artist.firebaseid,
        },
      };
      const centralStoreBank = new CentralBank(bankInfo);
      const savedBankInfo = await centralStoreBank.save();
      if (savedBankInfo) {
        const updatedWallet = await wallet.updateOne({
          $set: {
            Amount: wallet.Amount - parseFloat(req.body.acceptedAmount),
          },
        });
        if (updatedWallet.modifiedCount > 0) {
          res.status(200).json("Succesfully accepted the wallet");
        }
      }
    }
  } catch (error) {
    return next(createError(500, "Server Error"));
  }
};

//Release Central Payment for Artwork
const releaseCentralPaymentArtwork = async (req, res, next) => {
  try {
    const buyer = await User.findOne({
      _id: req.user.id,
    });
    if (!buyer) return next(createError(404, "User not logged in"));
    const payment = await CentralBank.findOne({
      proposalId: req.params.artworkId,
    });
    if (!payment) return next(createError(403, "Invalid Transaction!"));
    const artwork = await WonArtwork.findOne({
      artworkId: req.params.artworkId,
    });
    if (!artwork) return next(createError(403, "Artwork not found!"));
    if (payment.sender._id !== req.user.id)
      return next(createError(402, "Unauthorized to release payment!"));
    const artist = await Artist.findOne({
      _id: payment.receiver._id,
    });
    if (!artist) return next(createError(403, "Invalid Receiver!"));
    const wallet = await WalletBuyer.findOne({ buyerId: req.user.id });
    if (wallet) {
      //Updating buyer wallet
      await wallet.updateOne({
        $set: {
          ...wallet._doc,
          Transactions: [
            ...wallet.Transactions,
            {
              sent: true, //sender
              userName: artist.name,
              Amount: parseFloat(payment.amount),
            },
          ],
        },
      });
      //Updating artist wallet
      const artistWallet = await WalletArtist.findOne({
        artistId: artist._id,
      });
      if (artistWallet) {
        //Updating artist wallet
        await artistWallet.updateOne({
          $set: {
            ...artistWallet._doc,
            Amount:
              parseFloat(artistWallet.Amount) + parseFloat(payment.amount),
            Transactions: [
              ...artistWallet.Transactions,
              {
                sent: false, //receiver
                userName: buyer.name,
                Amount: parseFloat(payment.amount),
              },
            ],
          },
        });
      } //create a wallet for artist
      else {
        const newArtistWallet = new WalletArtist({
          Amount: parseFloat(payment.amount),
          artistId: artist._id,
          Transactions: [
            {
              sent: false, //receiver
              userName: buyer.name,
              Amount: parseFloat(payment.amount),
            },
          ],
        });
        await newArtistWallet.save();
      }
      const transactionInfo = {
        sender: {
          name: buyer.name,
          fid: payment.sender.fid,
        },
        receiver: {
          name: artist.name,
          fid: payment.receiver.fid,
        },
        amount: payment.amount,
      };
      await payment.deleteOne();
      await artwork.update({
        $set: {
          status: "paid",
        },
      });
      res.status(200).json(transactionInfo);
    } else return next(createError(403, "Wallet does exist!"));
  } catch (error) {
    return next(createError(500, "Server Error"));
  }
};

const giveRating = async (req, res, next) => {
  try {
    const buyer = await User.findOne({ _id: req.user.id });
    if (!buyer) return next(createError(404, "Buyer not logged in"));

    const artist = await Artist.findOne({
      _id: req.params.artistId,
    });
    if (!artist) return next(createError(404, "Artist not found!"));
    let options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date();
    await artist.update({
      $push: {
        rating: {
          ratedValue: req.body.ratedValue,
          buyerId: req.user.id,
          description: req.body.description,
          date: date.toLocaleString("en-GB", options),
        },
      },
    });

    if (buyer.ratedArtist.indexOf(artist._id) === -1) {
      await buyer.update({
        $push: {
          ratedArtist: artist._id,
        },
      });
    }

    res.status(200).json("Rating succesfully placed!");
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await Users.findByIdAndDelete(req.params.id);
    res.status(200).json("The User has been deleted!");
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

//update personal information of buyer
const updateInfo = async (req, res, next) => {
  try {
    const buyer = await Users.findOne({ _id: req.user.id });
    if (!buyer) return next(createError(404, "Buyer not logged in"));
    await buyer.updateOne({
      $set: {
        ...req.body,
      },
    });
    res.status(200).json("Buyer Information Updated Succesfully");
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const reportArtist = async (req, res, next) => {
  try {
    const buyer = await User.findOne({ _id: req.user.id });
    if (!buyer) return next(createError(404, "Buyer not logged In"));

    const artist = await Artist.findOne({
      _id: req.body.artistid,
    });
    if (!artist) return next(createError(404, "Artist not found!"));

    const report = await Reports.findOne({
      "buyer.id": buyer._id,
      "artist.id": artist._id,
      reportType: "artist",
    });

    if (report) return next(createError(400, "Already Reported"));
    //complete from here
    const newReport = new Reports({
      reportType: "artist",
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

const getAllReports = async (req, res, next) => {
  try {
    const reports = await Reports.find({});
    res.status(200).json(reports);
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

module.exports = {
  update,
  getUser,
  getAllUsers,
  getAllCount,
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
  getWonArtworks,
  claimArtwork,
  releaseCentralPaymentArtwork,
  giveRating,
  reportArtist,
  deleteUser,
  updateInfo,
  getAllReports,
  warnUser,
  unbanUser,
};
