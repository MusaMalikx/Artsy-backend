const express = require("express");
const fs = require("fs");
const { verifyToken } = require("../utils/verifyToken.js");
const {
  add,
  checkduplicate,
  getallartworks,
  getartworkimage,
} = require("../controllers/artwork.js");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./uploads/artworks/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});
const router = express.Router();

//Create Artwork
router.post("/add", verifyToken, upload.array("productImage", 3), add);

//Check Details
router.post("/check", verifyToken, checkduplicate);

//Get Artworks
router.get("/artist", verifyToken, getallartworks);

//Get Artwork Image
router.get("/image", getartworkimage);

module.exports = router;
