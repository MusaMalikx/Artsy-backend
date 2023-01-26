const mongoose = require("mongoose");
const centralBankSchema = new mongoose.Schema(
  {
    sender: {
      type: Object,
      required: true,
    },
    proposalId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    receiver: {
      type: Object,
      required: true,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("centralBank", centralBankSchema);
