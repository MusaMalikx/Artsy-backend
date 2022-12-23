import mongoose from "mongoose";
import User from "../models/Users.js";
import Artist from "../models/Artist.js";
import bcrypt from "bcryptjs";
import { createError } from "../error.js";
import jwt from "jsonwebtoken";


export const signupUser = async (req ,res , next ) => {
    try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);
        const newUser = new User({ ...req.body, password: hash });
    
        await newUser.save();
        res.status(200).send("User has been created!");
      } catch (err) {
        next(err);
      }
}

export const signupArtist = async (req ,res , next ) => {
  try {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(req.body.password, salt);
      const newArtist = new Artist({ ...req.body, password: hash });
  
      await newArtist.save();
      res.status(200).send("Artist has been created!");
    } catch (err) {
      next(err);
    }
}

export const signinArtist = async (req, res, next) => {
  try {
    const artist = await Artist.findOne({ email: req.body.email });
    if (!artist) return next(createError(404, "User not found!"));

    const isCorrect = await bcrypt.compare(req.body.password, artist.password);

    if (!isCorrect) return next(createError(400, "Wrong Credentials!"));

    const token = jwt.sign({ id: artist._id }, process.env.JWT);
    const { password, ...others } = artist._doc;

    
    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json(others);
  } catch (err) {
    next(err);
  }
};

export const signinUser = async (req, res, next) => {
    try {
      const artist = await User.findOne({ email: req.body.email });
      if (!artist) return next(createError(404, "User not found!"));
  
      const isCorrect = await bcrypt.compare(req.body.password, artist.password);
  
      if (!isCorrect) return next(createError(400, "Wrong Credentials!"));
  
      const token = jwt.sign({ id: artist._id }, process.env.JWT);
      const { password, ...others } = artist._doc;
  
      
      res
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .status(200)
        .json(others);
    } catch (err) {
      next(err);
    }
  };

  export const googleAuthUser = async (req, res, next) => {
    try {
      const artist = await User.findOne({ email: req.body.email });
      if (artist) {
        const token = jwt.sign({ id: artist._id }, process.env.JWT);
        res
          .cookie("access_token", token, {
            httpOnly: true,
          })
          .status(200)
          .json(artist._doc);
      } else {
        const newUser = new User({
          ...req.body,
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