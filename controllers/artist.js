const Artist = require("../models/Artist");

const getArtist = async (req, res, next) => {
  try {
    const artist = await Artist.findById(req.params.id);
    res.status(200).json(artist);
  } catch (err) {
    next(err);
  }
};

const getAllArtists = async (req, res, next) => {
  try {
    const artists = await Artist.find();
    res.status(200).json(artists);
  } catch (err) {
    next(err);
  }
};

module.exports = { getArtist, getAllArtists };
