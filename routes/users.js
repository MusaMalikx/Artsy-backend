const express = require("express");
const { verifyToken } = require("../utils/verifyToken");
const {
  update,
  getUser,
  getAllUser,
  checkUser,
} = require("../controllers/user");

const router = express.Router();

//update user
router.put("/update/:id", verifyToken, update);

//get a user
router.get("/find/:id", getUser);

//check a user
router.get("/check/:id", checkUser);

//get all user
router.get("/", getAllUser);

module.exports = router;
