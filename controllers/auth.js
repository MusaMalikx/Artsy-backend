import mongoose from "mongoose";
import User from "../models/Users.js";
import Artist from "../models/Artist.js";
import bcrypt from "bcryptjs";
import { createError } from "../error.js";
import jwt from "jsonwebtoken";


export const signupUser = async (req ,res , next ) => {
    try {
        const checkbuyer = await User.findOne({ email: req.body.email });
        if(checkbuyer) return next(createError(404, "Email already exists!"));

        const checkartist =  await Artist.findOne({ email: req.body.email });
        if(checkartist) return next(createError(404, "Email already exists For an Artist!"));

        const newUser = new User({ ...req.body });
    
        await newUser.save();
        res.status(200).send("User has been created!");
      } catch (err) {
        next(err);
      }
}

export const signinUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(createError(404, "User not found!"));

    const token = jwt.sign({ id: user._id }, process.env.JWT);
    
    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json(user._doc);
  } catch (err) {
    next(err);
  }
};

export const signupArtist = async (req ,res , next ) => {
  try {      
      const checkartist =  await Artist.findOne({ email: req.body.email });
      if(checkartist) return next(createError(404, "Email already exists!"));

      const checkbuyer = await User.findOne({ email: req.body.email });
      if(checkbuyer) return next(createError(404, "Email already exists For a Buyer!"));

      const newArtist = new Artist({ ...req.body });
  
      await newArtist.save();
      res.status(200).send("Artist has been created!");
    } catch (err) {
      next(err);
    }
}

export const checkDetailsArtist = async (req, res, next) => {
  try {
    const artistnum = await Artist.findOne({ phonenumber: req.body.phonenumber });
    if (artistnum) return next(createError(400, "PhoneNumber Already exists!"));

    const artistcnic = await Artist.findOne({ cnic: req.body.cnic });
    if(artistcnic) return next(createError(400, "cnic Already exists!"));
    
    if(!artistcnic && !artistnum)
      return res.send({status: 200 , message: "Details Ok"});

  } catch (err) {
    next(err);
  }
}

export const checkDetailsUser = async (req, res, next) => {
  try {
    const usernum = await User.findOne({ phonenumber: req.body.phonenumber });
    if (usernum) return next(createError(400, "PhoneNumber Already exists!"));

    const usercnic = await User.findOne({ cnic: req.body.cnic });
    if(usercnic) return next(createError(400, "cnic Already exists!"));
    
    if(!usercnic && !usernum)
      return res.send({status: 200 , message: "Details Ok"});

  } catch (err) {
    next(err);
  }
}

export const signinArtist = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ email: req.body.email });
    if (!artist) return next(createError(404, "User not found!"));

    const token = jwt.sign({ id: artist._id }, process.env.JWT);
  
    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json(artist._doc);
  } catch (err) {
    next(err);
  }
};

export const signinAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({  isAdmin: true , email: req.body.email});
    if (!user) return next(createError(401, "User not found!"));

    const token = jwt.sign({ id: user._id }, process.env.JWT);
    
    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json(user._doc);
  } catch (err) {
    next(err);
  }
};


  export const googleAuthUser = async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        const token = jwt.sign({ id: user._id }, process.env.JWT);
        res
          .cookie("access_token", token, {
            httpOnly: true,
          })
          .status(200)
          .json(user._doc);
      } else {
        const checkartist =  await Artist.findOne({ email: req.body.email });
        if(checkartist) return next(createError(404, "Email already exists For an Artist!"));

        const newUser = new User({
          name: req.body.displayName,
          email: req.body.email,
          firebaseid: req.body.firebaseid,
          fromGoogle: true,
        });
        const savedUser = await newUser.save();
        const token = jwt.sign({ id: savedUser._id }, process.env.JWT);
        res
          .cookie("access_token", token, {
            httpOnly: true,
          })
          .status(200)
          .json(savedUser._doc);
      }
    } catch (err) {
      next(err);
    }
  };

  export const googleAuthArtist = async (req, res, next) => {
    try {
      const artist = await Artist.findOne({ email: req.body.email });
      if (artist) {
        const token = jwt.sign({ id: artist._id }, process.env.JWT);
        res
          .cookie("access_token", token, {
            httpOnly: true,
          })
          .status(200)
          .json(artist._doc);
      } else {
        const checkbuyer = await User.findOne({ email: req.body.email });
        if(checkbuyer) return next(createError(404, "Email already exists For a Buyer!"));
        
        const newUser = new Artist({
          name: req.body.displayName,
          email: req.body.email,
          firebaseid: req.body.firebaseid,
          fromGoogle: true,
        });
        const savedUser = await newUser.save();
        const token = jwt.sign({ id: savedUser._id }, process.env.JWT);
        res
          .cookie("access_token", token, {
            httpOnly: true,
          })
          .status(200)
          .json(savedUser._doc);
      }
    } catch (err) {
      next(err);
    }
  };

  export const logout = async (req, res, next) => {
    // Set token to none and expire after 5 seconds
  res.cookie('access_token', 'none', {
      expires: new Date(Date.now() + 5 * 1000),
      httpOnly: true,
  })
  res
      .status(200)
      .json({ success: true, message: 'User logged out successfully' })
}