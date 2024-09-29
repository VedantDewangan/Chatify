const { GroupChat } = require("../DataBase/Model/GroupChat");
const { GroupChatMessage } = require("../DataBase/Model/GroupChatMessageModel");
const { User } = require("../DataBase/Model/UserModel");

const createGroupChat = async (req, res) => {
  try {
    const { users, admin, name, pic } = req.body;
    const username = req.user.username;

    const newGroupChat = await GroupChat.create({
      users: users,
      name: name,
      pic: pic,
      admin: admin,
    });

    await GroupChatMessage.insertMany({
      sender: admin,
      groupChatID: newGroupChat._id,
      message: `${username} created this group`,
      comp: true,
    });

    res.status(201).send({
      msg: "New Group is created",
      GroupDetails: newGroupChat,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      msg: "something went wrong",
    });
  }
};

const sendMessageInGroupChat = async (req, res) => {
  try {
    const { sender, message, time, date, groupChatID, imgURL } = req.body;

    const newMessage = await GroupChatMessage.create({
      message: message,
      sender: sender,
      time: time,
      date: date,
      groupChatID: groupChatID,
      imgURL: imgURL,
    });

    await GroupChat.findOneAndUpdate(
      { _id: groupChatID },
      { $push: { messages: newMessage._id } } // Corrected usage of $push
    );

    res.status(200).send({
      msg: "Message sent",
      newMsg: newMessage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      msg: "Something went wrong",
    });
  }
};

const fetchAllGroupChat = async (req, res) => {
  try {
    const MyId = req.user._id;

    const AllGroupChat = await GroupChat.find({
      users: { $in: [MyId] },
    }).sort({ updatedAt: -1 });

    res.status(200).send({
      AllGroupChat: AllGroupChat,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      msg: "Something went wrong",
    });
  }
};

const fetchAllGroupChatMessage = async (req, res) => {
  try {
    const { GroupChatID } = req.params;

    const AllMessage = await GroupChatMessage.find({
      groupChatID: GroupChatID,
    }).populate("sender", "name username");

    res.status(200).send({
      AllMessage: AllMessage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      msg: "Something went wrong",
    });
  }
};

const getAllFriendsList = async (req, res) => {
  try {
    const MyId = req.user._id;

    const user = await User.findOne({
      _id: MyId,
    }).populate("Friends", "name username profilepic");

    res.status(200).send({
      allFriend: user.Friends,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      msg: "Something went wrong",
    });
  }
};

const getDetailsOfGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await GroupChat.find({
      _id: id,
    })
      .populate("admin", "username name profilepic")
      .populate("users", "username name profilepic");

    res.status(200).send({
      groupDetails: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      msg: "somethig went wrong",
    });
  }
};

const addUser = async (req, res) => {
  try {
    const { users, groupID } = req.body;
    const name = req.user.username;
    const MyId = req.user._id;

    await GroupChat.updateOne(
      { _id: groupID },
      { $push: { users: { $each: users } } }
    );
    await GroupChatMessage.insertMany({
      sender: MyId,
      groupChatID: groupID,
      message: `${name} added new member`,
      comp: true,
    });

    res.status(200).send("Users added successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send({
      msg: "Error adding users",
      error: error.message,
    });
  }
};

const removeUser = async (req, res) => {
  try {
    const { userID, groupID } = req.body;
    const MyId = req.user._id;
    const name = req.user.username;
    const user = await User.find({
      _id: userID,
    });

    const group = await GroupChat.findById(groupID);

    if (!group) {
      return res.status(404).send("Group not found");
    }

    if (group.users.length <= 2) {
      return res
        .status(400)
        .send("Cannot remove the user, you have to delete the group");
    }

    await GroupChat.updateOne({ _id: groupID }, { $pull: { users: userID } });
    await GroupChatMessage.insertMany({
      sender: MyId,
      groupChatID: groupID,
      message: `${name} removed ${user[0].username}`,
      comp: true,
    });

    res.status(200).send("User removed successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send({
      msg: "Error removing user",
      error: error.message,
    });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const { groupID } = req.body;

    await GroupChat.deleteMany({
      _id: groupID,
    });

    await GroupChatMessage.deleteMany({
      groupChatID: groupID,
    });

    res.status(200).send({
      msg: "Group deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      msg: "Error deleting group",
      error: error.message,
    });
  }
};

module.exports = {
  createGroupChat,
  sendMessageInGroupChat,
  fetchAllGroupChat,
  fetchAllGroupChatMessage,
  getAllFriendsList,
  getDetailsOfGroup,
  addUser,
  removeUser,
  deleteGroup,
};
