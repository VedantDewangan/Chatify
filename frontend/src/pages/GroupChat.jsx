import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Box,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { NavBar } from "../Components/NavBar";
import {LoadingAnimation} from "../Components/LoadingAnimation"

export const GroupChat = () => {
  // if user is not login then navigate to the login page and getting data of logged in user
  const navigate = useNavigate();
  const { authUser } = useAuth();
  useEffect(() => {
    if (!localStorage.getItem("chatify")) {
      navigate("/login");
    }
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = React.useRef(null);
  const finalRef = React.useRef(null);
  const [allFriend, SetAllFriend] = useState([]);
  const [groupName, SetGroupName] = useState("");
  const [SelectedUsers, SetSelectedUsers] = useState([]);
  const [group_photo, SetGroupPhoto] = useState("");

  const SelectThisUser = (clickeduser) => {
    const a = allFriend.filter((user) => user.username != clickeduser.username);
    SetAllFriend(a);
    const b = [...SelectedUsers, clickeduser];
    SetSelectedUsers(b);
  };

  const DisSelectThisUser = (clickeduser) => {
    const a = SelectedUsers.filter(
      (user) => user.username != clickeduser.username
    );
    SetSelectedUsers(a);
    const b = [...allFriend, clickeduser];
    SetAllFriend(b);
  };

  const openModal = async () => {
    SetSelectedUsers([]);
    const { data } = await axios.get(
      "https://chatify-wols.onrender.com/api/getAllFriendsList",
      { withCredentials: true }
    );
    // console.log(data);
    SetAllFriend(data.allFriend);
    onOpen();
  };

  const uploadPhoto = (event) => {
    const file = event.target.files[0];
    SetGroupPhoto(file);
  };

  const CreateGroup = async (e) => {
    e.preventDefault();

    let finalGroupPhoto = group_photo;
    if(groupName===""){
      toast.error("please enter group name",{position:"top-right"});
      return;
    }

    if (typeof group_photo !== "string") {
      const data = new FormData();
      data.append("file", group_photo);
      data.append("upload_preset", "chatify");
      data.append("cloud_name", "do1lffrun");

      try {
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/do1lffrun/image/upload",
          {
            method: "POST",
            body: data,
          }
        );

        const cloudinaryData = await res.json();

        if (cloudinaryData.url) {
          finalGroupPhoto = cloudinaryData.url; // Use a local variable to store the photo URL
        } else {
          throw new Error("Image upload failed");
        }
      } catch (error) {
        console.log("Image upload error: ", error);
        return; // Exit function on error
      }
    } else {
      finalGroupPhoto =
        "https://cdn-icons-png.flaticon.com/512/1474/1474494.png"; // Default group photo
    }

    uploadGroupChat(finalGroupPhoto); // Pass the final group photo URL
  };

  const uploadGroupChat = async (groupPhoto) => {
    try {
      if (SelectedUsers.length < 2) {
        toast.error("Select at least 2 users", { position: "top-right" });
        return;
      }

      const { data } = await axios.post(
        "https://chatify-wols.onrender.com/api/createGroupChat",
        {
          users: [...SelectedUsers, authUser._id],
          admin: authUser._id,
          name: groupName,
          pic: groupPhoto, // Use the final group photo
        },
        {
          withCredentials: true,
        }
      );
      const a = [data.GroupDetails, ...AllGroupChat];
      SetAllGroupChat(a);
      onClose();
      toast.success("New Group Created", { position: "top-right" });
    } catch (error) {
      console.log("Group creation error: ", error);
      toast.error("Something went wrong", { position: "top-right" });
    }
  };

  // fetching the group chats and setting its lave and handling the loader
  const [Loading, SetLoading] = useState(false);
  const [AllGroupChat, SetAllGroupChat] = useState([]);
  useEffect(() => {
    const getAllGroupChat = async () => {
      SetLoading(true);
      try {
        const { data } = await axios.get(
          "https://chatify-wols.onrender.com/api/fetchAllGroupChat",
          { withCredentials: true }
        );
        SetAllGroupChat(data.AllGroupChat);
      } catch (error) {
        console.log(error);
        toast.error("someting went wrong", { position: "top-right" });
      }
      SetLoading(false);
    };
    getAllGroupChat();
  }, []);

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
            <div className="main-msg">
              <div className="main-msg-1">
                <Button
                  className="make-grp"
                  colorScheme="grey"
                  style={{ display: "block" }}
                  onClick={openModal}
                >
                  Create new group
                </Button>
                <Modal
                  initialFocusRef={initialRef}
                  finalFocusRef={finalRef}
                  isOpen={isOpen}
                  onClose={onClose}
                >
                  <ModalOverlay />
                  <ModalContent backgroundColor={"#202020"} color={"white"}>
                    <ModalHeader>Create new Group</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                      <FormControl>
                        <FormLabel>Enter Group Name</FormLabel>
                        <Input
                          value={groupName}
                          onChange={(e) => {
                            SetGroupName(e.target.value);
                          }}
                          ref={initialRef}
                          placeholder="Enter Group Name"
                        />
                      </FormControl>

                      <FormControl mt={4}>
                        <FormLabel>Choose Group Photo</FormLabel>
                        <input onChange={uploadPhoto} type="file" />
                      </FormControl>

                      <FormControl mt={4}>
                        <FormLabel>Select User</FormLabel>
                        <Box
                          display={"flex"}
                          gap={"10px"}
                          height={"80px"}
                          overflowY={"scroll"}
                        >
                          {allFriend.map((user) => (
                            <Box
                              onClick={() => {
                                SelectThisUser(user);
                              }}
                              key={user._id}
                              backgroundColor={"black"}
                              padding={"5px 10px"}
                              borderRadius={"5px"}
                              cursor={"pointer"}
                            >
                              <img
                                src={user.profilepic}
                                alt={`${user.username}'s profile`}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  borderRadius: "50%",
                                }}
                              />
                              <p>{user.username}</p>
                            </Box>
                          ))}
                        </Box>

                        <FormLabel>Selected User</FormLabel>
                        <Box
                          display={"flex"}
                          gap={"10px"}
                          height={"80px"}
                          overflowY={"scroll"}
                        >
                          {SelectedUsers.map((user, i) => {
                            return (
                              <Box
                                onClick={() => {
                                  DisSelectThisUser(user);
                                }}
                                key={user._id}
                                backgroundColor={"black"}
                                padding={"5px 10px"}
                                borderRadius={"5px"}
                                cursor={"pointer"}
                              >
                                <img
                                  src={user.profilepic}
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "50%",
                                  }}
                                  alt="img"
                                />
                                <p>{user.username}</p>
                              </Box>
                            );
                          })}
                        </Box>
                      </FormControl>
                    </ModalBody>

                    <ModalFooter>
                      <Button onClick={CreateGroup} colorScheme="gray" mr={3}>
                        Create
                      </Button>
                      <Button onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
              </div>
              <div
                style={{
                  marginTop: "10px",
                  height: "70vh",
                  overflow: "hidden",
                }}
              >
                {Loading?
                <LoadingAnimation height={"68vh"} />
                :
                AllGroupChat.map((groupChat) => {
                  return (
                    <div
                      className="groupChat"
                      onClick={() => {
                        navigate(`/singleGroupChat/${groupChat._id}`);
                      }}
                      key={groupChat._id}
                    >
                      <img src={groupChat.pic} alt="img" />
                      <div>{groupChat.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};
