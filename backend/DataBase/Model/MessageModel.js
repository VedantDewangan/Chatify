const mongoose = require("mongoose");

const MessageModel = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    default: " ",
  },
  time: {
    type: String,
    default: "",
  },
  date: {
    type: String,
    default: "",
  },
  isGroupChat: {
    type: Boolean,
    default: false,
  },
  imgURL: {
    type: String,
    default: "",
  },
});

const Message = mongoose.model("Message", MessageModel);

module.exports = {
  Message,
};
