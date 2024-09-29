const mongoose = require("mongoose");

const GroupChatSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GroupChatMessage",
      },
    ],
    name: {
      type: String,
      required: true,
    },
    pic: {
      type: String,
      required: true,
      default: "https://cdn-icons-png.flaticon.com/512/1474/1474494.png",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const GroupChat = mongoose.model("GroupChat", GroupChatSchema);

module.exports = {
  GroupChat,
};
