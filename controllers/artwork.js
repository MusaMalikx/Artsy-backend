const { createError } = require("../error");
const Artworks = require("../models/Artwork");
const Artist = require("../models/Artist");
const fs = require("fs");
const mime = require("mime");
const { verifyStatus, verifyDates } = require("../utils/verifyStatus");

const add = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ _id: req.user.id });
    if (!artist) return next(createError(404, "Artist Not logged in!"));

    console.log(req.files, req.body.title, req.user.id);
    const files = req.files;
    const paths = files.map((file) => file.path); //All paths of images

    // const msg = verifyDates(req.body.startdate, req.body.enddate);
    // if (msg !== "correct") return next(createError(403, msg));

    const status = verifyStatus(req.body.startdate, req.body.enddate);
    const newartwork = new Artworks({
      artistId: req.user.id,
      images: paths,
      status: status,
      ...req.body,
    });
    const savedArtwork = await newartwork.save();
    res.status(200).json(savedArtwork);

    //Now to get the image in get request we can make a new router.get("/uploads") where we find the url and return the image
    //Or we can make the uploads folder publically available so browser can access the images  in app.js write app.use('/uploads' , express.static('uploads'));
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
      name: artist.name,
      imageURL: artist.imageURL,
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
  try {
    const artworks = await Artworks.find({ status: "live" });
    res.status(200).json(artworks);
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const getAllArtworksByCategory = async (req, res, next) => {
  try {
    let { category } = req.query;
    const artworks = await Artworks.find({
      status: "live",
      category: category,
    });
    if (artworks) res.status(200).json(artworks);
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
    const artworks = await Artworks.find(searchQuery);

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

module.exports = {
  add,
  checkDuplicate,
  getArtistArtworks,
  getArtworkImage,
  getAllArtworks,
  getSearchedArtwork,
  getAllArtworksByCategory,
  getArtworkArtist,
  getBidInfo,
  updateStatus,
};
