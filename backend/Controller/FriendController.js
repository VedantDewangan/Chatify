const { FriendRequest } = require("../DataBase/Model/FriendRequest");
const { User } = require("../DataBase/Model/UserModel");
const { Converstion } = require("../DataBase/Model/ConversationModel");
const { Message } = require("../DataBase/Model/MessageModel");

const getAllFriendRequest = async (req, res) => {
  try {
    const MyId = req.user._id;
    const AllFriendRequest = await FriendRequest.find({
      receiverId: MyId,
    }).populate({
      path: "senderId",
      select: "-password", // Exclude password field
    });
    res.send({
      AllFriendRequest: AllFriendRequest,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Internal Error",
    });
  }
};

const searchUser = async (req, res) => {
  try {
    const { search } = req.query;
    const query = search;

    if (!query) {
      return res.status(400).send({
        error: "Query is required",
      });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ],
    });

    res.status(200).send({
      message: "Users found",
      allUsers: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Internal Server Error",
    });
  }
};

const sendFriendRequest = async (req, res) => {
  try {
    const MyId = req.user._id;
    const { FriendId } = req.body;

    const a = await FriendRequest.find({
      senderId: MyId,
      receiverId: FriendId,
    });

    if (a.length === 0) {
      await FriendRequest.insertMany({
        senderId: MyId,
        receiverId: FriendId,
      });
    }

    res.status(201).send({
      sendRequest: true,
      msg: "Friend Request send successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Internal Error",
    });
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const MyId = req.user._id;
    const { FriendId } = req.body;
    const user = await User.findByIdAndUpdate(
      MyId,
      { $push: { Friends: FriendId } },
      { new: true }
    );

    const user2 = await User.findByIdAndUpdate(
      FriendId,
      { $push: { Friends: MyId } },
      { new: true }
    );

    if (!user || !user2) {
      return res.status(404).send({ error: "User not found" });
    }

    await FriendRequest.deleteOne({
      senderId: FriendId,
      receiverId: MyId,
    });

    await FriendRequest.deleteOne({
      senderId: MyId,
      receiverId: FriendId,
    });

    const newMessage = await Message.create({
      sender: MyId,
      receiver: FriendId,
      message: "",
    });

    await Converstion.create({
      users: [MyId, FriendId],
      messages: [newMessage._id],
    });

    res.status(200).send({
      message: "Friend request accepted successfully",
      updatedUser: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Internal Error",
    });
  }
};

const declineFriendRequest = async (req, res) => {
  try {
    const MyId = req.user._id;
    const { FriendId } = req.body;

    await FriendRequest.deleteOne({
      senderId: FriendId,
      receiverId: MyId,
    });

    res.status(200).send({
      deletedFriendRequest: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: "Internal Error",
    });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const MyId = req.user._id;

    const user = await User.findOne({ _id: MyId })
      .select("-password")
      .populate("Friends", "name username profilepic");

    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }

    res.status(200).send(user);
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .send({ msg: "Error retrieving user details", error: error.message });
  }
};

module.exports = {
  searchUser,
  getAllFriendRequest,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getUserDetails,
};
