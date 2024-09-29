const express = require("express");
const {
  register,
  login,
  logout,
  forgetPassword,
  newPassword,
  changeProfilePic,
} = require("./Controller/UserController.js");
const {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  searchUser,
  getAllFriendRequest,
  getUserDetails,
} = require("./Controller/FriendController.js");
const { isLogin } = require("./middleware/isLogin.js");
const {
  getAllConversations,
  getAllMessage,
  getDetailsOfConverstion,
  sendMessage,
} = require("./Controller/MessageController.js");

const {
  createGroupChat,
  sendMessageInGroupChat,
  fetchAllGroupChat,
  fetchAllGroupChatMessage,
  getAllFriendsList,
  getDetailsOfGroup,
  addUser,
  removeUser,
  deleteGroup,
} = require("./Controller/GroupChatController.js");
const route = express.Router();

route.post("/register", register);
route.post("/login", login);
route.post("/logout", logout);
route.post("/frogetPassword", forgetPassword);
route.post("/newPassword", isLogin, newPassword);
route.put("/changeProfilePic", isLogin, changeProfilePic);

route.post("/searchUser", isLogin, searchUser);
route.get("/getAllFriendRequest", isLogin, getAllFriendRequest);
route.post("/sendFriendRequest", isLogin, sendFriendRequest);
route.post("/acceptFriendRequest", isLogin, acceptFriendRequest);
route.delete("/declineFriendRequest", isLogin, declineFriendRequest);
route.get("/getUserDetails", isLogin, getUserDetails);

route.get("/getAllConversations", isLogin, getAllConversations);
route.get("/getAllMessage", isLogin, getAllMessage);
route.get("/getDetailsOfConverstion/:ID", isLogin, getDetailsOfConverstion);
route.post("/sendMessage", isLogin, sendMessage);

route.post("/createGroupChat", isLogin, createGroupChat);
route.post("/sendMessageInGroupChat", isLogin, sendMessageInGroupChat);
route.get("/fetchAllGroupChat", isLogin, fetchAllGroupChat);
route.get("/fetchAllGroupChatMessage/:GroupChatID", fetchAllGroupChatMessage);
route.get("/getAllFriendsList", isLogin, getAllFriendsList);
route.get("/getDetailsOfGroup/:id", isLogin, getDetailsOfGroup);
route.put("/addUser", isLogin, addUser);
route.put("/removeUser", isLogin, removeUser);
route.delete("/deleteGroup", deleteGroup);

module.exports = {
  route,
};
