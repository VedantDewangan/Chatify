const { mongoose } = require("mongoose");

const GroupChatMessageModel = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  groupChatID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GroupChat",
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
    default: true,
  },
  imgURL: {
    type: String,
    default: "",
  },
  comp: {
    type: Boolean,
    default: false,
  },
});

const GroupChatMessage = mongoose.model(
  "GroupChatMessage",
  GroupChatMessageModel
);

module.exports = {
  GroupChatMessage,
};
