const mongoose = require("mongoose");
const wonArtwork = new mongoose.Schema(
  {
    artworkId: {
      type: mongoose.Types.ObjectId,
      ref: "artworks",
      required: true,
    },
    buyerId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref:'users'
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
