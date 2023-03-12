const mongoose = require("mongoose");
const wonArtwork = new mongoose.Schema(
  {
    artworkId: {
      type: String,
      ref: "Artwork",
      required: true,
    },
    buyerId: {
      type: String,
      required: true,
    },
    winningAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "claim",
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("wonArtwork", wonArtwork);
