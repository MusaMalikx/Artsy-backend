const express = require("express");
const {
  newConversation,
  getUserConversation,
} = require("../controllers/converstion");

const router = express.Router();

// New Conversation
router.post("/", newConversation);

// Get a Conversation of a user
router.get("/:userId", getUserConversation);

module.exports = router;
