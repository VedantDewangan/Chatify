const { Converstion } = require("../DataBase/Model/ConversationModel");
const { Message } = require("../DataBase/Model/MessageModel");
const { User } = require("../DataBase/Model/UserModel");
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotallySecretKey");

const getAllConversations = async (req, res) => {
  try {
    const MyId = req.user._id;
    const allConversations = await Converstion.find({
      users: {
        $in: [MyId],
      },
    })
      .populate("users", "-password")
      .sort({ updatedAt: -1 });

    res.send({
      allConversations: allConversations,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ error: "An error occurred while fetching conversations." });
  }
};

const getAllMessage = async (req, res) => {
  const { FriendId } = req.query;
  const MyId = req.user._id;

  try {
    const messages = await Message.find({
      $or: [
        { sender: MyId, receiver: FriendId },
        { sender: FriendId, receiver: MyId },
      ],
    });

    if (messages.length >= 2) {
      messages.forEach((msg) => {
        if (msg.message) {
          try {
            msg.message = cryptr.decrypt(msg.message);
          } catch (error) {
            console.error(`Error decrypting message: ${error.message}`);
          }
        } else {
          console.warn("Message property is missing:", msg);
        }
      });
    }
    res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error retrieving messages", error });
  }
};

const getDetailsOfConverstion = async (req, res) => {
  try {
    const { ID } = req.params;

    const user = await User.find({ _id: ID }).select("-password");

    res.send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send({ msg: "internal problem" });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { senderID, reciverID, message, time, date, imgURL } = req.body;
    let EncryptedMessage = "";
    if (message) EncryptedMessage = cryptr.encrypt(message);

    const newMsg = await Message.insertMany({
      sender: senderID,
      receiver: reciverID,
      message: EncryptedMessage,
      time: time,
      date: date,
      imgURL: imgURL,
    });

    await Converstion.updateOne(
      {
        users: { $all: [senderID, reciverID] },
      },
      {
        $push: { messages: newMsg[0]._id },
      }
    );

    res.send({
      msg: "message sent",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      msg: "internal error issue",
    });
  }
};

module.exports = {
  getAllConversations,
  getAllMessage,
  getDetailsOfConverstion,
  sendMessage,
};
