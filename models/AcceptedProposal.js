const mongoose = require("mongoose");
const acceptedProposal = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true,
    },
    proposalId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "buyerproposals",
    },
    paid: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    dateCreated: {
      type: String,
      required: true,
    },
    acceptedAmount: {
      type: Number,
      required: true,
    },
    artistInfo: {
      type: Object,
      required: true,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("acceptedProposal", acceptedProposal);
