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
    password: {
      type: String,
      default: 123456,
    },
    phonenumber: {
      type: String,
      default: "",
    },
    cnic: {
      type: String,
      default: "",
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
    location: {
      type: String,
      default: "",
    },
    languages: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Artist", ArtistSchema);
