const mongoose = require("mongoose");
const buyerWalletSchema = new mongoose.Schema(
  {
    buyerId: {
      type: String,
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

module.exports = mongoose.model("walletBuyer", buyerWalletSchema);
