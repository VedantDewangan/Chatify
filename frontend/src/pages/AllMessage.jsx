import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import socket from "./socket";
import { NavBar } from "../Components/NavBar";
import { LoadingAnimation } from "../Components/LoadingAnimation";
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
} from "@chakra-ui/react";

export const AllMessage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  // if user is not loggedin then navigate to the login page and fetching the user data
  const { authUser } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem("chatify")) {
      navigate("/login");
    }
  });

  // getting all the friends user have
  const [message, SetMessage] = useState([]);
  const [Loading, SetLoading] = useState(false);
  useEffect(() => {
    const getAllConverstion = async () => {
      SetLoading(true);
      try {
        const { data } = await axios.get(
          "http://localhost:3000/api/getAllConversations",
          { withCredentials: true }
        );
        SetMessage(data.allConversations);
      } catch (error) {
        toast.error("something went wrong", { position: "top-right" });
        console.log(error);
      }
      SetLoading(false);
    };
    getAllConverstion();
  }, []);

  // adding user details to online users anf fetching the other online users
  const [onlineUsers, setOnlineUsers] = useState([]);
  useEffect(() => {
    socket.on("connect", () => {
      // console.log(`connected ${socket.id}`);
    });

    socket.emit("user-joined", authUser.username);

    socket.on("user-list", (users) => {
      setOnlineUsers(Object.values(users));
    });

    socket.on("user-status", (data) => {});

    return () => {
      socket.off("connect");
      socket.off("user-list");
      socket.off("user-status");
    };
  }, [authUser.username]);
  const [selectedUser, setSelectedUser] = useState(null);

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
            <div className="main-msg" style={{ height: "80vh" }}>
              {Loading ? (
                <LoadingAnimation height={"75vh"} />
              ) : message?.length === 0 ? (
                <div className="main-msg-2">
                  {
                    <p style={{ textAlign: "center", padding: "10px" }}>
                      No Friends
                    </p>
                  }
                </div>
              ) : (
                <div className="main-msg-2">
                  {message.map((details, i) => {
                    const userDetails = details.users.filter(
                      (user) => user._id !== authUser._id
                    );
                    const user = userDetails[0]; // Assuming there's only one user for simplicity.

                    return (
                      <div key={i} className="each-msg">
                        <Button
                          onClick={() => {
                            setSelectedUser(user);
                            onOpen();
                          }}
                          style={{
                            height: "50px",
                            width: "50px",
                            borderRadius: "50%",
                            padding: "0px",
                            margin: "0px",
                          }}
                        >
                          <img
                            className="each-msg-img"
                            src={user.profilepic}
                            alt="img"
                          />
                        </Button>
                        <div
                          onClick={() => {
                            socket.emit("joinRoom", details._id);
                            navigate(`/message/${user._id}-${details._id}`);
                          }}
                        >
                          <p>{user.username}</p>
                          <p>{user.name}</p>
                        </div>
                        {onlineUsers.includes(user.username) ? (
                          <span
                            style={{
                              height: "8px",
                              width: "8px",
                              backgroundColor: "rgb(51, 255, 51)",
                              borderRadius: "50%",
                              margin: "10px 15px",
                              display: "inline-block",
                            }}
                          ></span>
                        ) : (
                          <span
                            style={{
                              height: "8px",
                              width: "8px",
                              backgroundColor: "rgb(255, 46, 46)",
                              borderRadius: "50%",
                              margin: "10px 15px",
                              display: "inline-block",
                            }}
                          ></span>
                        )}
                      </div>
                    );
                  })}

                  {/* Modal */}
                  {selectedUser && (
                    <Modal isOpen={isOpen} onClose={onClose}>
                      <ModalOverlay />
                      <ModalContent style={{width:"min-content",backgroundColor:"#292929"}} >
                        <div
                          style={{
                            borderRadius: "50%",
                            height: "50vh",
                            width: "50vh",
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            flexDirection:"column"
                          }}
                        >
                          <p
                            style={{
                              textAlign: "center",
                              color: "white",
                              fontSize: "1.2em",
                              fontWeight: "600",
                            }}
                          >
                            {selectedUser.username}
                          </p>
                          <div style={{borderRadius:"50%",backgroundColor:"black",height:"45vh",width:"45vh"}} >
                          <img style={{height:"45vh",width:"45vh",borderRadius:"50%",objectFit:"contain"}} src={selectedUser.profilepic} alt="" />
                          </div>
                        </div>
                      </ModalContent>
                    </Modal>
                  )}
                </div>
              )}
              <button
                className="ai-but"
                title="Talk With AI"
                onClick={() => {
                  navigate("/chatWithAI");
                }}
              >
                AI
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};
