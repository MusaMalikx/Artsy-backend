import { createError } from "../error.js";
import Artworks from "../models/Artwork.js";
import Artist from "../models/Artist.js";

export const add = async (req, res, next) => {

    try {
        const artist = await Artist.findOne({ _id: req.user.id });
        if (!artist) return next(createError(404, "Artist Not logged in!"));

        const newartwork = new Artworks({artistId: req.user.id , ...req.body});
        const savedArtwork = await newartwork.save();
        res.status(200).json(savedArtwork);
      } 
      catch (err) {
        next(err);
      }

};