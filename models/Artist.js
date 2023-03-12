const mongoose = require("mongoose");

const ArtistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    firebaseid: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phonenumber: {
      type: String,
    },
    cnic: {
      type: String,
    },
    fromGoogle: {
      type: Boolean,
      default: false,
    },
    experience: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    imageURL: {
      type: String,
      default: "",
    },
    rating: {
      type: [Object],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Artist", ArtistSchema);
