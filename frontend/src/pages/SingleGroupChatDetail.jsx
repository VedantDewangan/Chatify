import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
} from "@chakra-ui/react";
import { LoadingAnimation } from "../Components/LoadingAnimation";
import { CustomLoadingDots } from "../Components/CustomLoadingDots";

export const SingleGroupChatDetail = () => {
  const param = useParams();
  const navigate = useNavigate();
  const [fetchDataLoading, SetFetchDataLoading] = useState(false);
  const { authUser } = useAuth();

  const [details, SetDetails] = useState({
    id: "",
    name: "",
    pic: "",
    users: [],
    admin: {},
  });

  useEffect(() => {
    const getDetailOfGroupChat = async () => {
      SetFetchDataLoading(true);
      const { data } = await axios.get(
        `http://localhost:3000/api/getDetailsOfGroup/${param.id}`,
        {
          withCredentials: true,
        }
      );
      SetFetchDataLoading(false);

      const obj = {
        id: data.groupDetails[0]._id,
        name: data.groupDetails[0].name,
        pic: data.groupDetails[0].pic,
        users: data.groupDetails[0].users,
        admin: data.groupDetails[0].admin,
      };
      SetDetails(obj);
    };
    getDetailOfGroupChat();
  }, []);

  const {
    isOpen: isOpen1,
    onOpen: onOpen1,
    onClose: onClose1,
  } = useDisclosure();
  const {
    isOpen: isOpen2,
    onOpen: onOpen2,
    onClose: onClose2,
  } = useDisclosure();
  const [friendList, SetFriendList] = useState([]);
  const [selectedFriend, SetSelectedFriend] = useState([]);

  const getMyAllFriend = async () => {
    onOpen1();
    const { data } = await axios.get(
      "http://localhost:3000/api/getUserDetails",
      { withCredentials: true }
    );
    const a = data.Friends;
    const b = details.users.filter(
      (user) => user.username != details.admin.username
    );
    const c = a.filter((friend) => !b.some((user) => user._id === friend._id));
    SetFriendList(c);
  };

  const selectUser = (id) => {
    const a = friendList.filter((user) => user._id !== id);
    const b = friendList.filter((user) => user._id === id);
    SetFriendList(a);
    SetSelectedFriend(b);
  };

  const DisselectUser = (id) => {
    const a = selectedFriend.filter((user) => user._id !== id);
    const b = selectedFriend.filter((user) => user._id === id);
    SetFriendList(b);
    SetSelectedFriend(a);
  };

  const [addUserLoading, SetAddUserLoading] = useState(false);
  const addUser = async () => {
    SetAddUserLoading(true);
    if (selectedFriend.length === 0) {
      toast.error("please select the user", { position: "top-right" });
      SetAddUserLoading(false);
      return;
    }
    try {
      await axios.put(
        "http://localhost:3000/api/addUser",
        {
          groupID: details.id,
          users: selectedFriend,
        },
        { withCredentials: true }
      );
      toast.success("users added successfully", { position: "top-right" });
      const arr = [...details.users, ...selectedFriend];
      const obj = {
        id: details.id,
        name: details.name,
        pic: details.pic,
        users: arr,
        admin: details.admin,
      };
      SetDetails(obj);
      onClose1();
    } catch (error) {
      console.log(error);
      toast.error("somenting went wrong cannot add the user", {
        position: "top-right",
      });
    }
    SetAddUserLoading(false);
  };

  const [removeUserLoading, SetRemoveUserLoading] = useState(false);
  const removeUser = async (id) => {
    SetRemoveUserLoading(true);
    if (details.users.length <= 3) {
      toast.error(
        "Cannot remove the user as for group atleast 3 user must be there",
        { position: "top-right" }
      );
      SetRemoveUserLoading(false);
      return;
    }
    if (id === authUser._id) {
      toast.error("you can not remove youself", { position: "top-right" });
      SetRemoveUserLoading(false);
      return;
    }
    try {
      await axios.put(
        "http://localhost:3000/api/removeUser",
        {
          groupID: details.id,
          userID: id,
        },
        { withCredentials: true }
      );
      toast.success("user removed successfully", { position: "top-right" });
      const arr = details.users.filter((user) => user._id !== id);
      const obj = {
        id: details.id,
        name: details.name,
        pic: details.pic,
        users: arr,
        admin: details.admin,
      };
      SetDetails(obj);
    } catch (error) {
      console.log(error);
      toast.error("something went wrong , cannot remove the user", {
        position: "top-right",
      });
    }
    SetRemoveUserLoading(false);
  };

  const [deleteLoading, SetDeleteLoading] = useState(false);
  const deleteGroup = async () => {
    SetDeleteLoading(true);
    try {
      await axios.delete("http://localhost:3000/api/deleteGroup", {
        data: { groupID: details.id }, // Correct way to send data with DELETE
        withCredentials: true,
      });
      onClose2();
      toast.success("Group deleted Successfully", { position: "top-right" });
      navigate("/groupChat");
    } catch (error) {
      console.log(error);
      toast.error("something went wrong cannot delete this group", {
        position: "top-right",
      });
    }
    SetDeleteLoading(false);
  };

  return (
    <>
      <div className="page-home">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div
            className="page-container"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0px",
              margin: "0px",
            }}
          >
            <div
              className="detail-grp-cont single-msg-header"
              style={{
                height: "86vh",
                padding: "0px",
                margin: "0px",
                borderRadius: "20px",
                flexDirection: "column",
              }}
            >
              {fetchDataLoading ? (
                <LoadingAnimation height={"100%"} />
              ) : (
                <>
                  <div>
                    <span
                      title="back"
                      onClick={() => {
                        navigate(`/singleGroupChat/${param.id}`);
                      }}
                    >
                      Go Back
                    </span>
                  </div>
                  <div
                  className="detail-grp"
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      alignItems: "flex-start",
                      cursor: "pointer",
                    }}
                  >
                    <div
                    className="users-0"
                      style={{
                        width: "38vw",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: "20px",
                      }}
                    >
                      <img
                        src={details.pic}
                        style={{
                          margin: "10px",
                          cursor: "pointer",
                          width: "18vw",
                          height: "max-content",
                        }}
                        alt="img"
                      />
                      <p style={{ fontSize: "1.4em", opacity: 0.8 }}>
                        Group Name : {details.name}
                      </p>
                      <p
                        style={{
                          fontSize: "1.4em",
                          opacity: 0.8,
                          textAlign: "center",
                        }}
                      >
                        Admin :{" "}
                        <span style={{ color: "#00BFFF", fontSize: "1.4em" }}>
                          {details.admin.username}
                        </span>
                      </p>
                      <Button
                        style={{
                          margin: "5px auto",
                          display:
                            authUser.username === details.admin.username
                              ? "block"
                              : "none",
                        }}
                        colorScheme="red"
                        onClick={onOpen2}
                        isDisabled={deleteLoading}
                      >
                        {deleteLoading ? (
                          <CustomLoadingDots color={"white"} />
                        ) : (
                          "Delete Group"
                        )}
                      </Button>

                      <Modal isOpen={isOpen2} onClose={onClose2}>
                        <ModalOverlay />
                        <ModalContent>
                          <ModalHeader>
                            Do you want to delete this group?
                          </ModalHeader>
                          <ModalCloseButton />
                          <ModalBody></ModalBody>

                          <ModalFooter>
                            <Button
                              colorScheme="blue"
                              mr={3}
                              onClick={onClose2}
                            >
                              Close
                            </Button>
                            <Button
                              colorScheme="red"
                              onClick={() => {
                                deleteGroup();
                              }}
                            >
                              Delete
                            </Button>
                          </ModalFooter>
                        </ModalContent>
                      </Modal>
                    </div>
                    <div style={{ width: "38vw" }} className="users" >
                      <p
                        style={{
                          fontSize: "1.4em",
                          textAlign: "center",
                          opacity: "0.8",
                        }}
                      >
                        Users
                      </p>
                      <div
                        style={{
                          height: "55vh",
                          backgroundColor: "#292929",
                          overflowY: "auto",
                          borderRadius: "25px",
                        }}
                      >
                        {details.users.map((user) => {
                          return (
                            <>
                              <div
                                key={user._id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "0px 5px",
                                  margin: "5px 5px 0px 5px",
                                  backgroundColor: "black",
                                  borderRadius: "20px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <img src={user.profilepic} alt="" />
                                  <div>
                                    <p>{user.name}</p>
                                    <p>{user.username}</p>
                                  </div>
                                </div>
                                <div>
                                  <button
                                    style={{
                                      display:
                                        authUser.username ===
                                        details.admin.username
                                          ? "block"
                                          : "none",
                                      backgroundColor: "red",
                                      outline: "none",
                                      padding: "5px 10px",
                                      borderRadius: "10px",
                                    }}
                                    onClick={() => {
                                      removeUser(user._id);
                                    }}
                                    disabled={removeUserLoading}
                                  >
                                    {removeUserLoading ? (
                                      <CustomLoadingDots color={"white"} />
                                    ) : (
                                      "Remove"
                                    )}
                                  </button>
                                </div>
                              </div>
                            </>
                          );
                        })}
                      </div>
                      <Button
                        style={{
                          display:
                            authUser.username === details.admin.username
                              ? "block"
                              : "none",
                          margin: "5px auto",
                        }}
                        colorScheme="green"
                        onClick={getMyAllFriend}
                        isDisabled={addUserLoading}
                      >
                        {addUserLoading ? <CustomLoadingDots /> : "Add User"}
                      </Button>

                      <Modal isOpen={isOpen1} onClose={onClose1}>
                        <ModalOverlay />
                        <ModalContent>
                          <ModalHeader>Select User</ModalHeader>
                          <ModalCloseButton />
                          <ModalBody>
                            <p style={{ fontWeight: "600", padding: "5px" }}>
                              Avaliable User
                            </p>
                            <div
                              style={{
                                backgroundColor: "darkgray",
                                maxHeight: "35vh",
                                overflow: "auto",
                              }}
                            >
                              {friendList.length === 0 ? (
                                <p>No Friend Left</p>
                              ) : (
                                friendList.map((fri, i) => {
                                  return (
                                    <div
                                      key={i}
                                      onClick={() => {
                                        selectUser(fri._id);
                                      }}
                                      style={{
                                        cursor: "pointer",
                                        borderRadius: "10px",
                                        margin: "2px",
                                        padding: "5px",
                                        backgroundColor: "black",
                                        width: "max-content",
                                      }}
                                    >
                                      <img
                                        style={{
                                          height: "80px",
                                          width: "80px",
                                          borderRadius: "5px",
                                          objectFit: "cover",
                                          objectPosition: "centre",
                                        }}
                                        src={fri.profilepic}
                                        alt=""
                                      />
                                      <p
                                        style={{
                                          fontSize: "1em",
                                          color: "white",
                                          textAlign: "center",
                                        }}
                                      >
                                        {fri.username}
                                      </p>
                                      <p
                                        style={{
                                          fontSize: "0.7em",
                                          color: "white",
                                          textAlign: "center",
                                        }}
                                      >
                                        {fri.name}
                                      </p>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </ModalBody>
                          <ModalBody>
                            <p style={{ fontWeight: "600", padding: "5px" }}>
                              Selected User
                            </p>
                            <div
                              style={{
                                backgroundColor: "darkgray",
                                maxHeight: "35vh",
                                overflow: "auto",
                              }}
                            >
                              {selectedFriend.length === 0
                                ? null
                                : selectedFriend.map((fri, i) => {
                                    return (
                                      <div
                                        key={i + 1000000}
                                        onClick={() => {
                                          DisselectUser(fri._id);
                                        }}
                                        style={{
                                          cursor: "pointer",
                                          borderRadius: "10px",
                                          margin: "2px",
                                          padding: "5px",
                                          backgroundColor: "black",
                                          width: "max-content",
                                        }}
                                      >
                                        <img
                                          style={{
                                            height: "80px",
                                            width: "80px",
                                            borderRadius: "5px",
                                            objectFit: "cover",
                                            objectPosition: "centre",
                                          }}
                                          src={fri.profilepic}
                                          alt=""
                                        />
                                        <p
                                          style={{
                                            fontSize: "1em",
                                            color: "white",
                                            textAlign: "center",
                                          }}
                                        >
                                          {fri.username}
                                        </p>
                                        <p
                                          style={{
                                            fontSize: "0.7em",
                                            color: "white",
                                            textAlign: "center",
                                          }}
                                        >
                                          {fri.name}
                                        </p>
                                      </div>
                                    );
                                  })}
                            </div>
                          </ModalBody>

                          <ModalFooter>
                            <Button colorScheme="red" mr={3} onClick={onClose1}>
                              Close
                            </Button>
                            <Button onClick={addUser} colorScheme="green">
                              Add
                            </Button>
                          </ModalFooter>
                        </ModalContent>
                      </Modal>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};
