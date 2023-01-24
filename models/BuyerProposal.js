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
            type: Date,
            required: true,
        },
        expectedAmount: {
            type: Number,
            required: true,
        },
        artistProposals: {
            type: [Objects]
        }
    },
    { timestamps: false }
);

module.exports = mongoose.model("buyerProposal", buyerProposal);
