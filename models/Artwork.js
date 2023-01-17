const mongoose = require("mongoose");

const ArtworkSchema = new mongoose.Schema({
  artistId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  startdate: {
    type: String,
    required: true,
  },
  enddate: {
    type: String,
    required: true,
  },
  baseprice: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  description: {
    type: String,
  },
  images: {
    type: [String],
  },
  currentbid: {
    type: Number,
    default: 0,
  },
  currentbidder: {
    type: String,
  },
});

module.exports = mongoose.model("Artworks", ArtworkSchema);
