const mongoose = require("mongoose");
const User = require("../models/Users");
const Artist = require("../models/Artist");
// import bcrypt from "bcryptjs";
const { createError } = require("../error");
const jwt = require("jsonwebtoken");

const signupAdmin = async (req, res, next) => {
  try {
    const checkbuyer = await User.findOne({
      email: req.body.email,
    });
    if (checkbuyer) return next(createError(404, "Email already exists!"));

    const checkartist = await Artist.findOne({ email: req.body.email });
    if (checkartist) return next(createError(404, "Email already exists!"));

    const newUser = new User({ isAdmin: true, ...req.body });

    await newUser.save();
    res.send({ status: 200, message: "Admin has been created!" });
    // res.status(200).send("Admin has been created!");
  } catch (err) {
    next(err);
  }
};

const signupUser = async (req, res, next) => {
  try {
    const checkbuyer = await User.findOne({ email: req.body.email });
    if (checkbuyer) return next(createError(404, "Email already exists!"));

    const checkartist = await Artist.findOne({ email: req.body.email });
    if (checkartist)
      return next(createError(404, "Email already exists For an Artist!"));

    const newUser = new User({ ...req.body });

    await newUser.save();
    res.status(200).send("User has been created!");
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const signinUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ isAdmin: false, email: req.body.email });
    if (!user) return next(createError(404, "User not found!"));
    if (user.warnings === 3) return next(createError(404, "User Banned!"));

    const token = jwt.sign({ id: user._id }, process.env.JWT);

    const object = {
      token: token,
      user: user._doc,
    };

    res.status(200).json(object);
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const signinUserTest = async (req, res, next) => {
  try {
    // console.log(req.body);
    const user = await User.findOne({
      isAdmin: false,
      email: req.body.email,
      password: req.body.password,
    });
    // console.log(user);
    if (!user) return next(createError(404, "User not found!"));

    if (user.warnings === 3) return next(createError(404, "User Banned!"));

    const token = jwt.sign({ id: user._id }, process.env.JWT);

    const object = {
      token: token,
      user: user._doc,
    };

    res.status(200).json(object);
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const signupArtist = async (req, res, next) => {
  try {
    const checkartist = await Artist.findOne({ email: req.body.email });
    if (checkartist) return next(createError(404, "Email already exists!"));

    const checkbuyer = await User.findOne({ email: req.body.email });
    if (checkbuyer)
      return next(createError(404, "Email already exists For a Buyer!"));

    const newArtist = new Artist({ ...req.body });

    await newArtist.save();
    res.status(200).send("Artist has been created!");
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const checkDetailsArtist = async (req, res, next) => {
  try {
    const artistnum = await Artist.findOne({
      phonenumber: req.body.phonenumber,
    });
    if (artistnum) return next(createError(400, "PhoneNumber Already exists!"));

    const artistcnic = await Artist.findOne({ cnic: req.body.cnic });
    if (artistcnic) return next(createError(400, "cnic Already exists!"));

    if (!artistcnic && !artistnum)
      return res.send({ status: 200, message: "Details Ok" });
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const checkDetailsUser = async (req, res, next) => {
  try {
    const usernum = await User.findOne({ phonenumber: req.body.phonenumber });
    if (usernum) return next(createError(400, "PhoneNumber Already exists!"));

    const usercnic = await User.findOne({ cnic: req.body.cnic });
    if (usercnic) return next(createError(400, "cnic Already exists!"));

    if (!usercnic && !usernum)
      return res.send({ status: 200, message: "Details Ok" });
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const checkDetailsAdmin = async (req, res, next) => {
  try {
    if (req.body.fromgoogle === true) {
      if (req.body.code !== process.env.CODE)
        return next(createError(400, "Admin Code Incorrect!"));

      res.send({ status: 200, message: "Details Ok Google" });
    } else {
      if (req.body.code !== process.env.CODE)
        return next(createError(400, "Admin Code Incorrect!"));

      const usernum = await User.findOne({ phonenumber: req.body.phonenumber });
      if (usernum) return next(createError(400, "PhoneNumber Already exists!"));

      const usercnic = await User.findOne({ cnic: req.body.cnic });
      if (usercnic) return next(createError(400, "cnic Already exists!"));

      const artistnum = await Artist.findOne({
        phonenumber: req.body.phonenumber,
      });
      if (artistnum)
        return next(createError(400, "PhoneNumber Already exists!"));

      const artistcnic = await Artist.findOne({ cnic: req.body.cnic });
      if (artistcnic) return next(createError(400, "cnic Already exists!"));

      if (!usercnic && !usernum && !artistcnic && !artistnum)
        return res.send({ status: 200, message: "Details Ok" });
    }
  } catch (err) {
    next(err);
  }
};

const signinArtist = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ email: req.body.email });
    if (!artist) return next(createError(404, "User not found!"));
    if (artist.warnings === 3) return next(createError(404, "User Banned!"));

    const token = jwt.sign({ id: artist._id }, process.env.JWT);

    const object = {
      token: token,
      user: artist._doc,
    };

    res.status(200).json(object);
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const signinArtistTest = async (req, res, next) => {
  try {
    // console.log(req.body);
    const user = await Artist.findOne({
      email: req.body.email,
      password: req.body.password,
    });
    console.log(user);
    if (!user) return next(createError(404, "User not found!"));

    if (user.warnings === 3) return next(createError(404, "User Banned!"));

    const token = jwt.sign({ id: user._id }, process.env.JWT);

    const object = {
      token: token,
      user: user._doc,
    };

    res.status(200).json(object);
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const signinAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ isAdmin: true, email: req.body.email });
    if (!user) return next(createError(401, "User not found!"));

    const token = jwt.sign({ id: user._id }, process.env.JWT);

    const object = {
      token: token,
      user: user._doc,
    };

    res.status(200).json(object);
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const signinAdminTest = async (req, res, next) => {
  try {
    const user = await User.findOne({
      isAdmin: true,
      email: req.body.email,
      password: req.body.password,
    });
    if (!user) return next(createError(401, "User not found!"));

    const token = jwt.sign({ id: user._id }, process.env.JWT);

    const object = {
      token: token,
      user: user._doc,
    };

    res.status(200).json(object);
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const googleSigninAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ isAdmin: true, email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT);
      const object = {
        token: token,
        user: user._doc,
      };

      res.status(200).json(object);
    } else {
      return next(createError(404, "No Admin User Found!"));
    }
  } catch (err) {
    next(err);
  }
};

const googleSignupAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ isAdmin: true, email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT);
      const object = {
        token: token,
        user: user._doc,
      };

      res.status(200).json(object);
    } else {
      const checkbuyer = await User.findOne({
        email: req.body.email,
      });
      if (checkbuyer)
        return next(createError(404, "Email already exists For a Buyer!"));

      const checkartist = await Artist.findOne({ email: req.body.email });
      if (checkartist)
        return next(createError(404, "Email already exists For an Artist!"));

      const newUser = new User({
        name: req.body.displayName,
        email: req.body.email,
        firebaseid: req.body.firebaseid,
        fromGoogle: true,
        imageURL: req.body.imageURL,
        isAdmin: true,
      });
      const savedUser = await newUser.save();
      const token = jwt.sign({ id: savedUser._id }, process.env.JWT);

      const object = {
        token: token,
        user: savedUser._doc,
      };
      res.status(200).json(object);
    }
  } catch (err) {
    next(err);
  }
};

const googleAuthUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ isAdmin: false, email: req.body.email });
    if (user) {
      if (user.warnings === 3) return next(createError(404, "User Banned!"));
      const token = jwt.sign({ id: user._id }, process.env.JWT);
      const object = {
        token: token,
        user: user._doc,
      };

      res.status(200).json(object);
    } else {
      const checkadmin = await User.findOne({
        isAdmin: true,
        email: req.body.email,
      });
      if (checkadmin)
        return next(createError(404, "Email already exists For a Buyer!"));

      const checkartist = await Artist.findOne({ email: req.body.email });
      if (checkartist)
        return next(createError(404, "Email already exists For an Artist!"));

      const newUser = new User({
        name: req.body.displayName,
        email: req.body.email,
        firebaseid: req.body.firebaseid,
        fromGoogle: true,
        imageURL: req.body.imageURL,
      });
      const savedUser = await newUser.save();
      const token = jwt.sign({ id: savedUser._id }, process.env.JWT);

      const object = {
        token: token,
        user: savedUser._doc,
      };
      res.status(200).json(object);
    }
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

const googleAuthArtist = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ email: req.body.email });
    if (artist) {
      if (artist.warnings === 3) return next(createError(404, "User Banned!"));
      const token = jwt.sign({ id: artist._id }, process.env.JWT);
      const object = {
        token: token,
        user: artist._doc,
      };
      res.status(200).json(object);
    } else {
      const checkbuyer = await User.findOne({ email: req.body.email });
      if (checkbuyer)
        return next(createError(404, "Email already exists For a Buyer!"));

      const newUser = new Artist({
        name: req.body.displayName,
        email: req.body.email,
        firebaseid: req.body.firebaseid,
        fromGoogle: true,
        imageURL: req.body.imageURL,
      });
      const savedUser = await newUser.save();
      const token = jwt.sign({ id: savedUser._id }, process.env.JWT);
      const object = {
        token: token,
        user: savedUser._doc,
      };
      res.status(200).json(object);
    }
  } catch (err) {
    next(createError(500, "Server Error"));
  }
};

//USED ONLY FOR COOKIES NOT USED FOR NOW
const logout = async (req, res, next) => {
  // Set token to none and expire after 5 seconds
  res.cookie("access_token", "none", {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res
    .status(200)
    .json({ success: true, message: "User logged out successfully" });
};

module.exports = {
  signupUser,
  signinUser,
  signinUserTest,
  signupArtist,
  checkDetailsArtist,
  checkDetailsUser,
  checkDetailsAdmin,
  signinArtist,
  signinArtistTest,
  signinAdmin,
  signinAdminTest,
  signupAdmin,
  googleAuthUser,
  googleAuthArtist,
  googleSignupAdmin,
  googleSigninAdmin,
  logout,
};
