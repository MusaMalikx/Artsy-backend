const mongoose = require("mongoose");
const buyerProposal = new mongoose.Schema(
    {
        buyerId: {
            type: String,
            required: true,
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
        expectedAmount: {
            type: Number,
            required: true,
        },
        artistProposals: {
            type: [Object]
        }
    },
    { timestamps: false }
);

module.exports = mongoose.model("buyerProposal", buyerProposal);
