const { createError } = require("../error");
const Artworks = require("../models/Artwork");
const Artist = require("../models/Artist");
const fs = require("fs");
const util = require("util");
const readFileAsync = util.promisify(fs.readFile);
const mime = require("mime");
const { verifyStatus, verifyDates } = require("../utils/verifyStatus");
const wonArtwork = require("../models/WonArtwork");
const Users = require("../models/Users");
const mongoose = require("mongoose");

//gets a single artwork given its id
const getArtwork = async (req, res, next) => {
  try {
    const artwork = await Artworks.find({ _id: req.params.id });
    res.status(200).json(artwork);
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

//deletes an artwork only if it is closed with No bidder or if its status is upcomming
const deleteArtwork = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ _id: req.user.id });
    if (!artist) return next(createError(404, "Artist Not logged in!"));

    const artwork = await Artworks.findById(req.params.id);
    if (!artwork) next(createError(404, "Artwork Not Found"));
    if (artwork.status === "closed" && artwork.currentbid === 0) {
      await artwork.remove();
      return res.status(200).json({ message: "deleted" });
    } else if (artwork.status === "comming soon") {
      await artwork.remove();
      return res.status(200).json({ message: "deleted" });
    } else if (artwork.status === "closed") {
      next(createError(400, "Artwork Already Won"));
    } else if (artwork.status === "live") {
      next(createError(400, "Artwork Already Live"));
    } else {
      next(createError(400, "Can not delete"));
    }
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const add = async (req, res, next) => {
  console.log(req.body);
  try {
    const artist = await Artist.findOne({ _id: req.user.id });
    if (!artist) return next(createError(404, "Artist Not logged in!"));

    console.log(req.files, req.body.title, req.user.id);
    const files = req.files;
    const paths = files.map((file) => file.path); // All paths of images

    const imagesAll = await Promise.all(
      paths.map(async (path) => {
        try {
          const data = await readFileAsync(path);
          const base64Data = data.toString("base64");
          return `data:image/jpeg;base64, ${base64Data}`;
        } catch (err) {
          throw createError(404, err.message);
        }
      })
    );

    const status = verifyStatus(req.body.startdate, req.body.enddate);
    console.log(status);
    const newartwork = new Artworks({
      artistId: req.user.id,
      images: imagesAll,
      status: status,
      ...req.body,
    });
    const savedArtwork = await newartwork.save();
    res.status(200).json(savedArtwork);
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const checkDuplicate = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ _id: req.user.id });
    if (!artist) return next(createError(404, "Artist Not logged in!"));

    const artwork = await Artworks.findOne({
      title: req.body.title,
      baseprice: req.body.baseprice,
      description: req.body.description,
    });
    if (artwork) return next(createError(400, "Artwork Duplicate!"));

    const artwork2 = await Artworks.findOne({
      title: req.body.title,
      description: req.body.description,
    });
    if (artwork2) return next(createError(400, "Artwork Duplicate!"));

    if (!artwork && !artwork2) res.status(200).json({ message: "Okay" });
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const getArtistArtworks = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ _id: req.params.artistId });
    if (!artist) return next(createError(404, "Artist Not logged in!"));
    const artworks = await Artworks.find({ artistId: req.params.artistId });
    res.status(200).json({
      artworks: artworks,
      ...artist._doc,
    });
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const getCountArtworksStaus = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ _id: req.params.artistId });
    if (!artist) return next(createError(404, "Artist Not logged in!"));
    const status = req.query.status;
    const count = await Artworks.countDocuments({
      artistId: req.params.artistId,
      status,
    });

    res.status(200).json({
      count,
    });
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const getArtworkImage = async (req, res, next) => {
  try {
    const path = `${req.query.filename}`;
    const type = mime.getType(path);
    fs.readFile(path, (err, data) => {
      if (err) {
        return next(createError(404, err.message));
      }
      res.contentType(type);
      res.send(data);
    });
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const getAllArtworks = async (req, res, next) => {
  // console.log(req.query);

  try {
    // const artworksupcomming = await Artworks.find({ status: "comming soon" });
    // if (artworksupcomming) {
    //   for (let i = 0; i < artworksupcomming.length; i++) {
    //     const document = artworksupcomming[i];
    //     const status = verifyStatus(document.startdate, document.enddate);
    //     if (status === "live") {
    //       document.status = "live";
    //       await document.save();
    //     }
    //   }
    // }
    const { page, limit, status } = req.query;
    const startIndex = (page - 1) * limit;
    // const endIndex = page * limit;

    const totalCount = await Artworks.countDocuments({ status: status });
    const totalPages = Math.ceil(totalCount / limit);

    const artworks = await Artworks.find({ status: status })
      .skip(startIndex)
      .limit(limit);
    res.status(200).json({ artworks, total: totalCount });
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const getAllArtworksHome = async (req, res, next) => {
  try {
    const artworksupcomming = await Artworks.find({ status: "comming soon" });
    if (artworksupcomming) {
      for (let i = 0; i < artworksupcomming.length; i++) {
        const document = artworksupcomming[i];
        const status = verifyStatus(document.startdate, document.enddate);
        if (status === "live") {
          document.status = "live";
          await document.save();
        }
      }
    }

    const artworks = await Artworks.find({ status: "live" })
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json(artworks);
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const getAllArtworksByCategory = async (req, res, next) => {
  try {
    let { category, status, limit, page } = req.query;

    const startIndex = (page - 1) * limit;
    // const endIndex = page * limit;

    const totalCount = await Artworks.countDocuments({ status: status });
    const totalPages = Math.ceil(totalCount / limit);

    // const artworks = await Artworks.find({ status: status })
    //   .skip(startIndex)
    //   .limit(limit);
    // res.status(200).json({ artworks, total: totalPages });

    const artworks = await Artworks.find({
      status: status,
      category: category,
    })
      // .skip(startIndex)
      .limit(limit);

    console.log(artworks);
    // res.status(200).json({ artworks, total: totalPages });
    if (artworks) res.status(200).json({ artworks, total: totalPages });
    else return next(createError(404, "Category Not Found"));
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const getSearchedArtwork = async (req, res, next) => {
  try {
    const keyword = req.query.keyword;
    //Seprates out the string with spaces and treates each word as seprate and searches artwork
    const cleanedKeyword = keyword.replace(/\s+/g, " ");
    const keywordsArray = cleanedKeyword
      .trim()
      .split(" ")
      .filter((word) => word !== "");
    if (!keywordsArray.length)
      return next(createError(404, "Please provide non empty search"));

    const searchQuery = {
      status: "live",
      $or: keywordsArray.map((word) => ({
        $or: [
          { title: new RegExp(word, "i") },
          { description: new RegExp(word, "i") },
        ],
      })),
    };
    const artworks = await Artworks.find(searchQuery).limit(30);

    //Does not seprate out keywords and searches the exact String
    // const artworks = await Artworks.find({
    //   $or: [
    //     { title: { $regex: keyword, $options: "i" } },
    //     { description: { $regex: keyword, $options: "i" } },
    //   ],
    // });

    if (artworks.length !== 0) res.status(200).json(artworks);
    else return next(createError(404, "No Artwork Found"));
  } catch (err) {
    next(createError(500, err));
  }
};

const getArtworkArtist = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ _id: req.query.id });
    if (!artist)
      return next(createError(404, "Error Finding Artist Information!"));

    res.status(200).json(artist.name);
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const getBidInfo = async (req, res, next) => {
  try {
    const artwork = await Artworks.findOne({ _id: req.params.artId });
    if (!artwork) return next(createError(404, "Invalid Artwork"));
    // console.log(artwork);
    res.status(200).json({
      currentBid: artwork.currentbid,
      basePrice: artwork.baseprice,
      currentBidder: artwork.currentbidder,
      buyerInfo:
        artwork.bidderList.filter((e) => e.bidderId == req.user.id).length >= 1
          ? artwork.bidderList.filter((e) => e.bidderId == req.user.id)[0]
          : {},
    });
  } catch (error) {
    next(createError(500, "Server Error"));
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const artwork = await Artworks.findById(req.params.id);
    if (!artwork) return res.status(404).send("Artwork not found");

    const { status } = req.body;
    if (!status) return res.status(400).send("Status is required");
    if (artwork.status === status)
      return res.status(200).send("Status is already set to that value");

    //To check if an artowrk is closed and has a winning bidder make
    if (artwork.currentbid !== 0 && status === "closed") {
      const newartwork = new wonArtwork({
        artworkId: artwork._id,
        buyerId: artwork.bidderList[artwork.bidderList.length - 1].bidderId,
        winningAmount: artwork.currentbid,
      });
      await newartwork.save();
    }

    artwork.status = status;
    await artwork.save();

    res.status(200).json(artwork);
    // const updatedArtwork = await Artworks.findByIdAndUpdate(
    //   req.params.id,
    //   { $set: { status: req.body.status } },
    //   { new: true }
    // );
    // res.status(200).json(updatedArtwork);
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

// Get Bidders list of firebase Ids for artwork along with artist firebase Id

const getBiddersList = async (req, res, next) => {
  try {
    const artwork = await Artworks.findById(req.params.artId);
    if (!artwork) return res.status(404).send("Artwork not found");
    const artist = await Artist.findById(artwork.artistId);
    if (!artist) return res.status(403).send("Artist not found");
    const bidInfo = {
      winner: "",
      losers: [],
      artistFid: artist.firebaseid,
    };

    if (artwork.bidderList.length > 0) {
      artwork.bidderList.sort((e1, e2) => {
        return e2.bid - e1.bid;
      });
      for (let i = 0; i < artwork.bidderList.length; i++) {
        if (i === 0) bidInfo.winner = artwork.bidderList[i].bidderFid;
        else bidInfo.losers.push(artwork.bidderList[i].bidderFid);
      }
    }
    res.status(200).json(bidInfo);
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

//Get listed artworks by artist closed or live or upcomming
const getArtistListedArtworks = async (req, res, next) => {
  try {
    let status = req.query.status;
    const artist = await Artist.findOne({ _id: req.user.id });
    if (!artist) return next(createError(404, "Artist Not logged in!"));

    if (status === "All") {
      const artworks = await Artworks.aggregate([
        {
          $match: { artistId: mongoose.Types.ObjectId(req.user.id) },
        },
        {
          $lookup: {
            from: "wonartworks",
            let: { artworkId: { $toString: "$_id" } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$artworkId", "$$artworkId"],
                  },
                },
              },
            ],
            as: "wonArtworks",
          },
        },
        {
          $unwind: {
            path: "$wonArtworks",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: "$_id",
            title: { $first: "$title" },
            status: { $first: "$status" },
            enddate: { $first: "$enddate" },
            totalBids: { $first: "$bidderList" },
            paymentStatus: { $first: "$wonArtworks.status" },
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            enddate: 1,
            status: 1,
            totalBids: { $size: "$totalBids" },
            paymentStatus: "$paymentStatus",
          },
        },
        {
          $sort: {
            title: 1,
          },
        },
      ]);
      res.status(200).json(artworks);
    } else {
      const artworks = await Artworks.aggregate([
        {
          $match: {
            artistId: mongoose.Types.ObjectId(req.user.id),
            status: status.toLowerCase(),
          },
        },
        {
          $lookup: {
            from: "wonartworks",
            let: { artworkId: { $toString: "$_id" } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$artworkId", "$$artworkId"],
                  },
                },
              },
            ],
            as: "wonArtworks",
          },
        },
        {
          $unwind: {
            path: "$wonArtworks",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: "$_id",
            title: { $first: "$title" },
            status: { $first: "$status" },
            enddate: { $first: "$enddate" },
            totalBids: { $first: "$bidderList" },
            paymentStatus: { $first: "$wonArtworks.status" },
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            enddate: 1,
            status: 1,
            totalBids: { $size: "$totalBids" },
            paymentStatus: "$paymentStatus",
          },
        },
        {
          $sort: {
            title: 1,
          },
        },
      ]);
      res.status(200).json(artworks);
    }
  } catch (err) {
    next(createError(500, err));
  }
};

const getRecommendation = async (req, res, next) => {
  try {
    const { artistId } = req.query;
    const currentArtist = await Artist.findById(
      mongoose.Types.ObjectId(artistId),
      { rating: 1 }
    );
    // if (!currentArtist) return next(createError(404, "Artist not found!"));
    let rating = 0;
    for (let i = 0; i < currentArtist.rating.length; i++) {
      rating += currentArtist.rating[i].ratedValue;
    }

    const averageRating =
      rating / currentArtist.rating.length === 0
        ? 1
        : currentArtist.rating.length;

    // console.log(averageRating);

    if (averageRating !== 0) {
      const artist = await Artist.aggregate([
        {
          $match: {
            _id: { $ne: mongoose.Types.ObjectId(artistId) },
          },
        },
        {
          $match: {
            $expr: {
              $gt: [{ $size: "$rating" }, 1],
            },
          },
        },
        {
          $lookup: {
            from: "artworks",
            localField: "_id",
            foreignField: "artistId",
            let: { id: "$_id" },
            pipeline: [
              {
                $match: {
                  status: "live",
                },
              },
            ],
            as: "artwork",
          },
        },
        {
          $addFields: {
            averageRating: { $avg: "$rating.ratedValue" },
          },
        },
        {
          $project: {
            name: 1,
            artwork: 1,
            distance: {
              $sqrt: {
                $add: [
                  {
                    $pow: [
                      {
                        $subtract: [averageRating, "$averageRating"],
                      },
                      2,
                    ],
                  },
                  {
                    $pow: [{ $subtract: [averageRating, "$averageRating"] }, 2],
                  },
                ],
              },
            },
          },
        },
        {
          $match: {
            distance: { $ne: null },
          },
        },
        {
          $sort: { distance: 1 },
        },
        {
          $limit: 5,
        },
      ]).exec();
      return res.status(200).json(artist);
    }
    return res.status(200).json([]);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getArtwork,
  deleteArtwork,
  add,
  checkDuplicate,
  getArtistArtworks,
  getCountArtworksStaus,
  getArtworkImage,
  getAllArtworks,
  getAllArtworksHome,
  getSearchedArtwork,
  getAllArtworksByCategory,
  getArtworkArtist,
  getBidInfo,
  updateStatus,
  getBiddersList,
  getArtistListedArtworks,
  getRecommendation,
};
