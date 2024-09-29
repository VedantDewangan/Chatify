import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import audio from "../public/notify.mp3";
import socket from "./socket";
import InputEmoji from "react-input-emoji";
import SpeechToText from "speech-to-text";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-hot-toast";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import {
  faMicrophone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import { LoadingMessage } from "../Components/LoadingMessage";
import { SpinnerLoading } from "../Components/SpinnerLoading";
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

export const SingleMessage = () => {
  // if user is not loggedin then navigate to the login page and fetching the imp details
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const param = useParams();
  const [id, roomID] = param.id.split("-");
  useEffect(() => {
    if (!localStorage.getItem("chatify")) {
      navigate("/login");
    }
  });

  // user previos message and details of friend and handling the loading for previous message
  const [loadingMessage, SetLoadingMessage] = useState(false);
  const [messages, SetMessages] = useState([]);
  const [details, SetDetails] = useState([
    {
      profilepic: "",
      name: "",
      username: "",
    },
  ]);
  useEffect(() => {
    const getDetailOfConv = async () => {
      const { data } = await axios.get(
        `http://localhost:3000/api/getDetailsOfConverstion/${id}`,
        {
          withCredentials: true,
        }
      );
      SetDetails(data);
    };

    const getAllMessage = async () => {
      SetLoadingMessage(true);
      const { data } = await axios.get(
        "http://localhost:3000/api/getAllMessage",
        {
          params: { FriendId: id },
          withCredentials: true,
        }
      );
      SetLoadingMessage(false);
      const a = data.filter((msg) => {
        if (msg.imgURL) {
          if (msg.message === "" && msg.imgURL === "") {
            return false;
          } else {
            return true;
          }
        } else {
          if (msg.message === "") {
            return false;
          } else {
            return true;
          }
        }
      });
      SetMessages(a);
    };
    const num = Math.floor(Math.random() * 6);
    SetStartMsg(start[num]);
    getDetailOfConv();
    getAllMessage();
  }, []);

  // ref for automatic scrolling
  const containerRef = useRef(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  // user inout message and starting message if there is no previous message
  const [startMsg, SetStartMsg] = useState("");
  const [inputMessage, SetMessage] = useState("");
  const start = [
    "Don't be shy, say hi! 🐱‍👤",
    "Go ahead, make the first move... we dare you! 😜",
    "Say something witty... or just say 'hi'.",
    "Break the ice, but not your screen! 🧊💥",
    "Start typing... the keyboard won't bite! 🐍",
    "Type something cool... or just pretend you're typing 🤫",
    "Make some noise... even if it's just a keyboard click! 🎵",
  ];

  // if message is image then
  const [file, SetFile] = useState(null);
  const fileInputRef = useRef(null);
  const handleIconClick = () => {
    fileInputRef.current.click();
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (
      file &&
      (file.type === "image/png" ||
        file.type === "image/jpg" ||
        file.type === "image/jpeg")
    ) {
      SetFile(file);
      toast.success("image selected", { position: "top-right" });
    } else {
      toast.error("Cannot select the choosen file", { position: "top-right" });
    }
  };
  // download the file (image)
  const downloadImage = (URL) => {
    const imageUrl = `${URL}`;
    const fileName = "downloaded-image.jpg";
    axios({
      url: imageUrl,
      method: "GET",
      responseType: "blob",
    })
      .then((response) => {
        const blob = new Blob([response.data]); // Create a blob from the response data
        const link = document.createElement("a"); // Create a link element
        link.href = window.URL.createObjectURL(blob); // Use `createObjectURL` to create a URL for the blob
        link.download = fileName; // Set the file name for download
        document.body.appendChild(link); // Append the link to the body
        link.click(); // Programmatically click the link to trigger the download
        document.body.removeChild(link); // Remove the link after download
      })
      .catch(console.error);
  };
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [interimText, setInterimText] = useState("");
  const [finalisedText, setFinalisedText] = useState([]);
  const [lis, SetLis] = useState(false);
  const [listening, setListening] = useState(false);
  const listenerRef = useRef(null);

  useEffect(() => {
    const onAnythingSaid = (text) => {
      setInterimText(text);
      if (typeof text === "string") {
        // setFinalisedText((prevText) => [text, ...prevText]);
        SetMessage(text);
      } else {
        console.error("Finalised text is not a string:", text);
      }
    };

    const onEndEvent = () => {
      // console.log("Speech ended"); // Debugging
      setListening(false);
    };

    const onFinalised = (text) => {
      // console.log("Finalised Text Received: ", text); // Debugging
      // console.log(typeof text);

      // if (typeof text === "string") {
      //   setFinalisedText((prevText) => [text, ...prevText]);
      //   SetMessage(text); // Update inputMessage with finalised text
      // } else {
      //   console.error("Finalised text is not a string:", text);
      // }
      setInterimText("");
    };

    try {
      listenerRef.current = new SpeechToText(
        onFinalised,
        onEndEvent,
        onAnythingSaid
      );
      // console.log("SpeechToText Initialized Successfully");
    } catch (err) {}

    return () => {
      if (
        listenerRef.current &&
        typeof listenerRef.current.stopListening === "function"
      ) {
        listenerRef.current.stopListening();
        // console.log("Listener Stopped");
      }
    };
  }, []);

  const startListening = () => {
    if (listening) {
      // console.log("Already listening");
      return;
    }

    // console.log("Starting to Listen...");
    if (
      listenerRef.current &&
      typeof listenerRef.current.startListening === "function"
    ) {
      listenerRef.current.startListening();
      setListening(true);
    } else {
      // console.error("startListening method is not available");
    }
  };

  const stopListening = () => {
    if (!listening) {
      // console.log("Not listening");
      return;
    }

    try {
      // console.log("Stopping Listening...");
      if (
        listenerRef.current &&
        typeof listenerRef.current.stopListening === "function"
      ) {
        listenerRef.current.stopListening();
        setListening(false);
      } else {
        console.error("stopListening method is not available");
      }
    } catch (err) {
      console.error("Failed to stop listening: ", err);
      setError(err.message);
    }
  };

  socket.emit("joinRoom", roomID);
  const [onlineUsers, setOnlineUsers] = useState([]);
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
  useEffect(() => {
    socket.on("connect", () => {
      // console.log(`connected ${socket.id}`);
    });

    socket.on("recive", (data) => {
      if (data.roomNumber === roomID) {
        const sound = new Audio(audio);
        sound.play();
        SetMessages((previousMessages) => [...previousMessages, data.obj]);
      }
    });

    return () => {
      socket.off("recive");
    };
  }, []);

  const [sendLoading, SetSendLoading] = useState(false);
  const [loadingIMG, setLoadingIMG] = useState(false);
  const sendMessage = async (e) => {
    e.preventDefault();
    const xyz = new Date();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let fileURL = "";
    if (file) {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "chatify");
      data.append("cloud_name", "do1lffrun");

      // Wait for Cloudinary upload to complete
      setLoadingIMG(true);
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/do1lffrun/image/upload",
        {
          method: "POST",
          body: data,
        }
      );
      setLoadingIMG(false);

      const cloudinaryData = await res.json();

      if (cloudinaryData.url) {
        fileURL = cloudinaryData.url; // Set URL from Cloudinary
        // console.log(fileURL);
      } else {
        throw new Error("Image upload failed");
      }
    }

    if (inputMessage === "" && !file) {
      return;
    }

    const obj = {
      message: inputMessage,
      receiver: id,
      sender: authUser._id,
      imgURL: fileURL,
      time: `${xyz.getHours().toString().padStart(2, "0")}:${xyz
        .getMinutes()
        .toString()
        .padStart(2, "0")}`,
      date: `${xyz.getDate()} ${monthNames[xyz.getMonth()]} ${xyz
        .getFullYear()
        .toString()
        .slice(-2)}`,
    };
    socket.emit("send", {
      roomNumber: roomID,
      obj: obj,
    });
    SetSendLoading(true);
    await axios.post(
      "http://localhost:3000/api/sendMessage",
      {
        senderID: authUser._id,
        reciverID: id,
        message: inputMessage,
        time: obj.time,
        date: obj.date,
        imgURL: fileURL,
      },
      {
        withCredentials: true,
      }
    );
    SetSendLoading(false);
    const a = [...messages, obj];
    SetMessages(a);
    SetMessage("");
    SetFile("");
  };

  return (
    <>
      <div className="page-home">
        <div className="page-container">
          <div className="single-msg-header">
            <span
              title="back"
              onClick={() => {
                navigate("/message");
              }}
            >
              ←
            </span>
            <Button
              onClick={() => {
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
                src={details[0].profilepic}
                alt="img"
              />
            </Button>
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent
                style={{ width: "min-content", backgroundColor: "#292929" }}
              >
                <div
                  style={{
                    borderRadius: "50%",
                    height: "50vh",
                    width: "50vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
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
                    {details[0].username}
                  </p>
                  <div
                    style={{
                      borderRadius: "50%",
                      backgroundColor: "black",
                      height: "45vh",
                      width: "45vh",
                    }}
                  >
                    <img
                      style={{
                        height: "45vh",
                        width: "45vh",
                        borderRadius: "50%",
                        objectFit: "contain",
                      }}
                      src={details[0].profilepic}
                      alt=""
                    />
                  </div>
                </div>
              </ModalContent>
            </Modal>
            <div>
              <p>{details[0].username}</p>
              <p>{details[0].name}</p>
            </div>
            {onlineUsers.includes(details[0].username) ? (
              <>
                <span
                  style={{
                    height: "8px",
                    width: "8px",
                    backgroundColor: "rgb(51, 255, 51)",
                    borderRadius: "50%",
                    margin: "10px 0px",
                    display: "inline-block",
                  }}
                ></span>
                <span
                  style={{
                    opacity: "0.6",
                    fontSize: "medium",
                  }}
                >
                  Online
                </span>
              </>
            ) : (
              <>
                <span
                  style={{
                    height: "8px",
                    width: "8px",
                    backgroundColor: "rgb(255, 46, 46)",
                    borderRadius: "50%",
                    margin: "10px 8px",
                    display: "inline-block",
                  }}
                ></span>
                <span
                  style={{
                    opacity: "0.6",
                    fontSize: "medium",
                  }}
                >
                  Offline
                </span>
              </>
            )}
          </div>
          <div className="single-msg-con" ref={containerRef}>
            {loadingMessage ? (
              <LoadingMessage />
            ) : messages.length === 0 ? (
              <p className="start-msg">{startMsg}</p>
            ) : (
              messages.map((msg, i) => {
                // console.log(msg);

                return (
                  <>
                    {msg.imgURL ? (
                      msg.imgURL === "" ? (
                        <div
                          key={i}
                          className={
                            msg.sender === authUser._id ? "sender" : "reciver"
                          }
                        >
                          <p>{msg.message}</p>
                          <div>
                            <p>{msg.date}</p>
                            <p>{msg.time}</p>
                          </div>
                        </div>
                      ) : (
                        <div
                          key={i}
                          className={
                            msg.sender === authUser._id ? "sender" : "reciver"
                          }
                          style={{ paddingTop: "15px" }}
                        >
                          <div style={{ position: "relative" }}>
                            <img
                              src={msg.imgURL}
                              alt="img"
                              style={{
                                padding: "5px 0px 5px 10px",
                                width: "100%",
                                maxWidth: "50vw",
                                objectFit: "cover",
                                objectPosition: "centre",
                              }}
                            />
                            <button
                              onClick={() => {
                                downloadImage(msg.imgURL);
                              }}
                              style={{
                                position: "absolute",
                                bottom: "10px",
                                right: "10px",
                                height: "50px",
                                width: "50px",
                                opacity: "0.9",
                                fontSize: "1.2em",
                                borderRadius: "50%",
                                backgroundColor: "black",
                              }}
                            >
                              <FontAwesomeIcon icon={faDownload} />
                            </button>
                          </div>
                          <p style={{ textAlign: "start" }}>{msg.message}</p>
                          <div>
                            <p>{msg.date}</p>
                            <p>{msg.time}</p>
                          </div>
                        </div>
                      )
                    ) : (
                      <div
                        key={i}
                        className={
                          msg.sender === authUser._id ? "sender" : "reciver"
                        }
                      >
                        <p>{msg.message}</p>
                        <div>
                          <p>{msg.date}</p>
                          <p>{msg.time}</p>
                        </div>
                      </div>
                    )}
                  </>
                );
              })
            )}
          </div>
          <div
            className="single-msg-inp"
            style={{ display: "flex", alignItems: "center" }}
          >
            <form onSubmit={sendMessage}>
              <button
                className={lis ? "lis" : "not-lis"}
                onClick={() => {
                  if (lis) {
                    stopListening();
                    SetLis(false);
                  } else {
                    startListening();
                    SetLis(true);
                  }
                }}
              >
                {lis ? (
                  <FontAwesomeIcon icon={faMicrophoneSlash} />
                ) : (
                  <FontAwesomeIcon icon={faMicrophone} />
                )}
              </button>
              <button>
                {loadingIMG ? (
                  <SpinnerLoading />
                ) : (
                  <FontAwesomeIcon
                    icon={faImage}
                    onClick={handleIconClick}
                    style={{ cursor: "pointer", fontSize: "24px" }}
                  />
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </button>
              <InputEmoji
                value={inputMessage}
                onClick={sendMessage}
                onEnter={sendMessage}
                onChange={SetMessage}
                placeholder="Type a message"
                title="Write Message"
              />
              {sendLoading ? (
                <SpinnerLoading />
              ) : (
                <button type="submit" title="Send Message">
                  ➤
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
