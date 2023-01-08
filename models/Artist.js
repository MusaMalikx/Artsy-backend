const mongoose = require("mongoose");


const ArtistSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
          },
          firebaseid: {
            type: String,
            required: true
          },
          email: {
            type: String,
            required: true,
            unique: true,
          },
          phonenumber: {
            type: String,
            unique: true,
          },
          cnic: {
            type: String,
            unique: true,
          },
          fromGoogle: {
            type: Boolean,
            default: false,
          },
          experience: {
            type: String,
            default: ''
          },
          address: {
            type: String,
            default: ''
          },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Artist", ArtistSchema);