const express = require("express");
const { getMessage, newMessage } = require("../controllers/message");

const router = express.Router();

// New Message
router.post("/", newMessage);

// Get a Message of a coversation
router.get("/:conversationId", getMessage);

module.exports = router;
