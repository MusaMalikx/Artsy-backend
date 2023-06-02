const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    firebaseid: {
      type: String,
      required: true,
      unique: true,
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
    isAdmin: {
      type: Boolean,
      default: false,
    },
    imageURL: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    languages: {
      type: String,
      default: "",
    },
    ratedArtist: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
