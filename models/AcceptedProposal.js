const mongoose = require("mongoose");
const acceptedProposal = new mongoose.Schema(
    {
        buyerId: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        dateCreated: {
            type: Date,
            required: true,
        },
        acceptedAmount: {
            type: Number,
            required: true,
        },
        artistId: {
            type: Object
        }
    },
    { timestamps: false }
);

module.exports = mongoose.model("acceptedProposal", acceptedProposal);
