const mongoose = require("mongoose");
const artistWalletSchema = new mongoose.Schema(
  {
    artistId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    Amount: {
      type: Number,
      required: true,
    },
    Transactions: {
      type: [Object],
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("walletArtist", artistWalletSchema);
