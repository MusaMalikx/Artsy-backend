const Conversation = require("../models/Conversation.js");

const newConversation = async (req, res, next) => {
  const newConversation = new Conversation({
    members: [req.body.sender_id, req.body.receiver_id],
  });
  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    next(err);
  }
};

const getUserConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversation );
  } catch (err) {
    next(err);
  }
};

module.exports = { newConversation, getUserConversation };
