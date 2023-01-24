const express = require("express");
const { getAllArtists, getArtist } = require("../controllers/artist");

const router = express.Router();

//get a artist
router.get("/:id", getArtist);

//get all artists
router.get("/", getAllArtists);

module.exports = router;
