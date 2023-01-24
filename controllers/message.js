const Message = require("../models/Message");

const newMessage = async (req, res, next) => {
  const newMessage = new Message(req.body);
  try {
    const saveMessage = await newMessage.save();
    res.status(200).json(saveMessage);
  } catch (err) {
    next(err);
  }
};

const getMessage = async (req, res, next) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    next(err);
  }
};

module.exports = { newMessage, getMessage };
