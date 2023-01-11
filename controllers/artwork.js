const { createError } = require("../error.js");
const Artworks = require("../models/Artwork.js");
const Artist = require("../models/Artist.js");

const add = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ _id: req.user.id });
    if (!artist) return next(createError(404, "Artist Not logged in!"));

    console.log(req.files , req.body.title , req.user.id);
    const files = req.files;
    const paths = files.map(file => file.path);  //All paths of images
  
    const newartwork = new Artworks({ artistId: req.user.id,images: paths, ...req.body });
    const savedArtwork = await newartwork.save();
    res.status(200).json(savedArtwork);

    //Now to get the image in get request we can make a new router.get("/uploads") where we find the url and return the image
    //Or we can make the uploads folder publically available so browser can access the images  in app.js write app.use('/uploads' , express.static('uploads'));

  } catch (err) {
    next(err);
  }

};

const checkduplicate = async (req, res, next) => {
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
    next(err);
  }
};

const getallartworks = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ _id: req.user.id });
    if (!artist) return next(createError(404, "Artist Not logged in!"));

    const artworks = await Artworks.find({ artistId: req.user.id });
    res.status(200).json(artworks);
  } catch (err) {
    next(err);
  }
};

module.exports = { add, checkduplicate, getallartworks };
