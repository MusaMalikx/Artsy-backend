const mongoose = require("mongoose");

const ArtworkSchema = new mongoose.Schema({
  artistId: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'artists'
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
  status: {
    type: String,
  },
  currentbid: {
    type: Number,
    default: 0,
  },
  currentbidder: {
    type: String,
  },
  bidderList: {
    type: Array,
  },
});

module.exports = mongoose.model("Artworks", ArtworkSchema);
