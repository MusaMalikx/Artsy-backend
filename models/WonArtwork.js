const mongoose = require("mongoose");
const wonArtwork = new mongoose.Schema(
  {
    artworkId: {
      type: mongoose.Schema.Types.ObjectId,
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
      type: Boolean,
      default: false,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("wonArtwork", wonArtwork);
