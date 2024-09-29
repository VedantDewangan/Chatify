import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { NavBar } from "../Components/NavBar";
import { motion } from "framer-motion";
import { Input, InputGroup, Button, InputRightElement } from "@chakra-ui/react";
import axios from "axios";
import { toast } from "react-hot-toast";
import socket from "./socket";

export const Home = () => {
  // if user is not login then navigate to the login page and getting data of logged in user
  const navigate = useNavigate();
  const { authUser } = useAuth();
  useEffect(() => {
    if (!localStorage.getItem("chatify")) {
      navigate("/login");
    }
  });

  // changing the new profile photo
  const [profilepic, setProfilepic] = useState(authUser.profilepic);
  const profilepicChange = (event) => {
    const file = event.target.files[0];
    if (
      file.type === "image/png" ||
      file.type === "image/jpg" ||
      file.type === "image/jpeg"
    ) {
      setProfilepic(file);
    }
    toast.error("Cannot upload selected file", { position: "top-right" });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("file", profilepic);
    data.append("upload_preset", "chatify");
    data.append("cloud_name", "do1lffrun");

    // Wait for Cloudinary upload to complete
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/do1lffrun/image/upload",
      {
        method: "POST",
        body: data,
      }
    );

    const cloudinaryData = await res.json();
    let newProfilePic = "";
    if (cloudinaryData.url) {
      newProfilePic = cloudinaryData.url; // Set URL from Cloudinary
    } else {
      throw new Error("Image upload failed");
    }

    try {
      const { data } = await axios.put(
        "https://chatify-wols.onrender.com/api/changeProfilePic",
        {
          username: authUser.username,
          newProfilePic: newProfilePic,
        },
        {
          withCredentials: true,
        }
      );
      if (data.success) {
        setProfilepic(newProfilePic);
        toast.success(data.msg, { position: "top-right" });
      }
    } catch (error) {
      console.log(error);
      toast.error("someting went wrong", { position: "top-right" });
    }
  };

  // new password management
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);
  const [newPassword, SetNewPassword] = useState("");
  const changePassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "https://chatify-wols.onrender.com/api/newPassword",
        { newPassword: newPassword, username: authUser.username },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Password Changed Successfully", {
          position: "top-right",
        });
      }
      SetNewPassword("");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong", { position: "top-right" });
    }
  };

  // logging out the user
  const logout = async () => {
    try {
      await axios.post("https://chatify-wols.onrender.com/api/logout");
      localStorage.clear();
      toast.success("Logout Successfully", {
        position: "top-right",
      });
      navigate("/login");
      socket.emit("user-logout", authUser.username);
    } catch (error) {
      toast.error("Something went wrong , can't logout", {
        position: "top-right",
      });
    }
  };

  // search new User
  const [searchInput, SetSearchInput] = useState("");
  const [searched_users, SetSearchedUser] = useState([]);
  const [loadingSearch, SetLoadingSearch] = useState(false);
  const [searching, SetSearching] = useState(false);
  const searchUser = async (e) => {
    e.preventDefault();
    setEntred(searchInput);
    try {
      if (searchInput !== "") {
        if (searchInput.length <= 2) {
          toast.error("please enter atleast 3 character", {
            position: "top-right",
          });
          return;
        }
        SetLoadingSearch(true);
        const { data } = await axios.post(
          `https://chatify-wols.onrender.com/api/searchUser?search=${searchInput}`,{},{withCredentials:true}
        );
        SetLoadingSearch(false);
        SetSearching(true);
        const searched_users = data.allUsers.filter((user) => {
          if (user.username !== authUser.username) {
            if (user.Friends.includes(authUser._id)) {
              return false;
            } else {
              return true;
            }
          } else {
            return false;
          }
        });
        SetSearchedUser(searched_users);
      }
    } catch (error) {
      toast.error("someting went wrong");
      console.log(error);
    }
  };

  const [entred, setEntred] = useState("");
  const [friend_req, setFriendReq] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const sendFriendRequest = async (FriendId) => {
    try {
      const { data } = await axios.post(
        "https://chatify-wols.onrender.com/api/sendFriendRequest",
        {
          FriendId: FriendId,
        },
        {
          withCredentials: true,
        }
      );
      if (data.sendRequest) {
        toast.success(data.msg, { position: "top-right" });
      }
      SetSearchInput("");
      SetSearchedUser([]);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong", {
        position: "top-right",
      });
    }
  };

  useEffect(() => {
    const getFriendReq = async () => {
      const { data } = await axios.get(
        "https://chatify-wols.onrender.com/api/getAllFriendRequest",
        { withCredentials: true }
      );
      setFriendReq(data.AllFriendRequest);
    };
    getFriendReq();
  }, [friend_req]);

  const declineFriendRequest = async (ID) => {
    try {
      await axios.delete("https://chatify-wols.onrender.com/api/declineFriendRequest", {
        data: { FriendId: ID }, // Sending the FriendId in the request body
        withCredentials: true,
      });
      const a = friend_req.filter((user) => user._id !== ID);
      setFriendReq(a);
    } catch (error) {
      toast.error("Something went wrong", {
        position: "top-right",
      });
      console.log(error);
    }
  };

  const acceptFriendRequest = async (ID) => {
    try {
      const { data } = await axios.post(
        "https://chatify-wols.onrender.com/api/acceptFriendRequest",
        {
          FriendId: ID,
        },
        { withCredentials: true }
      );
      const a = friend_req.filter((user) => user._id !== ID);
      setFriendReq(a);
      toast.success(data.message, { position: "top-right" });
    } catch (error) {
      toast.error("Something went wrong", {
        position: "top-right",
      });
      console.log(error);
    }
  };

  useEffect(() => {
    socket.on("connect", () => {
      // console.log(`connected ${socket.id}`);
    });

    socket.emit("user-joined", authUser.username);

    socket.on("user-list", (users) => {
      setOnlineUsers(Object.values(users));
    });

    socket.on("user-status", (data) => {
      // console.log(`${data.user} is ${data.status}`);
    });

    return () => {
      socket.off("connect");
      socket.off("user-list");
      socket.off("user-status");
    };
  }, [authUser.username]);

  return (
    <>
      <div className="page-home">
        <div className="page-container">
          <NavBar />
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="main">
              <div className="main-1">
                <div className="main-1-1">
                  <img
                    style={{ height: "100px" }}
                    src={profilepic}
                    alt="Profile Pic"
                  />
                  <div>
                    <p>FULL NAME : {authUser.name}</p>
                    <p>USERNAME : {authUser.username}</p>
                    <p>GENDER : {authUser.gender}</p>
                  </div>
                </div>

                <div className="main-1-2">
                  <form onSubmit={handleSubmit}>
                    <p>Upload new Profile Photo</p>
                    <input
                      className="file"
                      onChange={profilepicChange}
                      type="file"
                    />
                    <Button type="submit">CHANGE PROFILE PHOTO</Button>
                  </form>
                  <form onSubmit={changePassword}>
                    <p>
                      Enter New Password <span className="star">*</span>{" "}
                    </p>
                    <InputGroup size="md">
                      <Input
                        value={newPassword}
                        onChange={(e) => {
                          SetNewPassword(e.target.value);
                        }}
                        pr="4.5rem"
                        type={show ? "text" : "password"}
                        placeholder="Enter new password"
                        name="password"
                        autoComplete="off"
                      />
                      <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={handleClick}>
                          {show ? "Hide" : "Show"}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <Button type="submit" m={0} p={0} fontSize={"small"}>
                      CHANGE PASSWORD
                    </Button>
                  </form>
                  <Button
                    style={{
                      fontSize: "large",
                      backgroundColor: "red",
                      opacity: 1,
                      color: "white",
                      padding: "5px 15px",
                    }}
                    onClick={logout}
                  >
                    Logout
                  </Button>
                </div>
              </div>
              <div className="main-2">
                <div className="main-2-1">
                  <form onSubmit={searchUser} className="search-inp">
                    <input
                      value={searchInput}
                      onChange={(e) => {
                        SetSearchInput(e.target.value);
                        SetSearching(false);
                      }}
                      type="text"
                      placeholder="Search User"
                    />
                    <button type="submit">Search</button>
                  </form>
                  {loadingSearch ? (
                    <div>Loading...</div>
                  ) : searched_users.length == 0 ? (
                    searching ? (
                      <div>No User Found</div>
                    ) : null
                  ) : (
                    searched_users.map((details, i) => {
                      return (
                        <div className="fri" key={i}>
                          <img src={details.profilepic} alt="img" />
                          <div className="fri-name">
                            <p>{details.username}</p>
                            <p>{details.name}</p>
                          </div>
                          <div className="fri-buts">
                            <button
                              className="fri-but"
                              style={{
                                height: "max-content",
                                width: "max-content",
                                borderRadius: "8px",
                                padding: "8px 12px",
                              }}
                              onClick={() => sendFriendRequest(details._id)}
                            >
                              send
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="main-2-2">
                  <p>Friend Request</p>
                  <div className="fri-con">
                    {friend_req.map((details, i) => {
                      return (
                        <div className="fri" key={i}>
                          <img src={details.senderId.profilepic} alt="img" />
                          <div className="fri-name">
                            <p>{details.senderId.username}</p>
                            <p>{details.senderId.name}</p>
                          </div>
                          <div className="fri-buts">
                            <button
                              onClick={() => {
                                acceptFriendRequest(details.senderId._id);
                              }}
                              className="fri-but"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => {
                                declineFriendRequest(details.senderId._id);
                              }}
                              className="fri-but"
                            >
                              ✗
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};
