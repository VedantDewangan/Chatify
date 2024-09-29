const mongoose = require("mongoose");

const ConverstionSchema = new mongoose.Schema(
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
        ref: "Message",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Converstion = mongoose.model("Converstion", ConverstionSchema);

module.exports = {
  Converstion,
};
