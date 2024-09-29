const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: 5,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    profilepic: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      min: 4,
      required: true,
    },
    Friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);

module.exports = { User };
