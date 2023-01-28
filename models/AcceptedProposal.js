const mongoose = require("mongoose");
const acceptedProposal = new mongoose.Schema(
  {
    buyerId: {
      type: String,
      required: true,
    },
    proposalId: {
      type: String,
      required: true,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    title: {
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
