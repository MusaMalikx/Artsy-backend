const express = require("express");
const { getAllArtists, getArtist } = require("../controllers/artist");

const router = express.Router();

//get a artist
router.get("/find/:id", getArtist);

//get all artists
router.get("/", getAllArtists);

module.exports = router;
