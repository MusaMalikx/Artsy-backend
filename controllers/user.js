const { createError } = require("../error.js");
const Artist = require("../models/Artist.js");

// import createError from "../error";
// import User from "../models/Users";

const User = require("../models/Users.js");

const update = async (req, res, next) => {
  if (req.params.id === req.user.id) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedUser);
    } catch (err) {
      next(err);
    }
  } else {
    return next(createError(403, "You can update only your account!"));
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

const getAllUser = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

const checkUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);
    if (user) user = { ...user._doc, type: "buyer" };
    if (!user) {
      user = await Artist.findById(req.params.id);
      user = { ...user._doc, type: "artist" };
    }
    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

module.exports = { update, getUser, getAllUser, checkUser };
