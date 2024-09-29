import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import InputEmoji from "react-input-emoji";
import SpeechToText from "speech-to-text";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import audio from "../public/notify.mp3";
import { toast } from "react-hot-toast";
import socket from "./socket";
import {
  faMicrophone,
  faMicrophoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import { SpinnerLoading } from "../Components/SpinnerLoading";

export const SingleGroupChat = () => {
  const navigate = useNavigate();
  const param = useParams();
  const { authUser } = useAuth();
  const { id } = param;
  const [messages, SetMessages] = useState([]);
  const [startMsg, SetStartMsg] = useState("");
  const [inputMessage, SetMessage] = useState("");
  const [interimText, setInterimText] = useState("");
  const [finalisedText, setFinalisedText] = useState([]);
  const [lis, SetLis] = useState(false);
  const [listening, setListening] = useState(false);
  const listenerRef = useRef(null);
  const containerRef = useRef(null);
  const [details, SetDetails] = useState({
    name: "",
    pic: "",
    users: [],
    admin: {},
  });

  const [file, SetFile] = useState(null);
  const fileInputRef = useRef(null);
  const [sendLoading, SetSendLoading] = useState(false);
  const [loadingIMG, setLoadingIMG] = useState(false);
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

  socket.emit("joinRoom", id);
  const start = [
    "Don't be shy, say hi! 🐱‍👤",
    "Go ahead, make the first move... we dare you! 😜",
    "Say something witty... or just say 'hi'.",
    "Break the ice, but not your screen! 🧊💥",
    "Start typing... the keyboard won't bite! 🐍",
    "Type something cool... or just pretend you're typing 🤫",
    "Make some noise... even if it's just a keyboard click! 🎵",
  ];

  useEffect(() => {
    if (!localStorage.getItem("chatify")) {
      navigate("/login");
    }
  });

  useEffect(() => {
    const getDetailOfGroupChat = async () => {
      const { data } = await axios.get(
        `https://chatify-wols.onrender.com/api/getDetailsOfGroup/${id}`,
        {
          withCredentials: true,
        }
      );
      const obj = {
        name: data.groupDetails[0].name,
        pic: data.groupDetails[0].pic,
        users: data.groupDetails[0].users,
        admin: data.groupDetails[0].admin,
      };
      SetDetails(obj);
    };

    const getAllMessage = async () => {
      const { data } = await axios.get(
        `https://chatify-wols.onrender.com/api/fetchAllGroupChatMessage/${id}`,
        {
          withCredentials: true,
        }
      );
      SetMessages(data.AllMessage);
    };

    const num = Math.floor(Math.random() * 6);
    SetStartMsg(start[num]);
    getDetailOfGroupChat();
    getAllMessage();
  }, []);

  useEffect(() => {
    const onAnythingSaid = (text) => {
      setInterimText(text);
      if (typeof text === "string") {
        SetMessage(text);
      } else {
        console.error("Finalised text is not a string:", text);
      }
    };

    const onEndEvent = () => {};

    const onFinalised = (text) => {
      // console.log("Finalised Text Received: ", text);
      // console.log(typeof text);
      setInterimText("");
    };

    try {
      listenerRef.current = new SpeechToText(
        onFinalised,
        onEndEvent,
        onAnythingSaid
      );
    } catch (err) {}

    return () => {
      if (
        listenerRef.current &&
        typeof listenerRef.current.stopListening === "function"
      ) {
        listenerRef.current.stopListening();
        SetLis(false);
      }
    };
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();

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
    SetSendLoading(true);
    const { data } = await axios.post(
      "https://chatify-wols.onrender.com/api/sendMessageInGroupChat",
      {
        sender: authUser._id,
        message: inputMessage,
        time: `${xyz.getHours().toString().padStart(2, "0")}:${xyz
          .getMinutes()
          .toString()
          .padStart(2, "0")}`,
        date: `${xyz.getDate()} ${monthNames[xyz.getMonth()]} ${xyz
          .getFullYear()
          .toString()
          .slice(-2)}`,
        groupChatID: id,
        imgURL: fileURL,
      },
      { withCredentials: true }
    );
    SetSendLoading(false);
    const obj = {
      message: inputMessage,
      receiver: null,
      sender: authUser._id,
      time: `${xyz.getHours().toString().padStart(2, "0")}:${xyz
        .getMinutes()
        .toString()
        .padStart(2, "0")}`,
      date: `${xyz.getDate()} ${monthNames[xyz.getMonth()]} ${xyz
        .getFullYear()
        .toString()
        .slice(-2)}`,
      imgURL: fileURL,
    };
    socket.emit("send", {
      roomNumber: id,
      obj: obj,
    });
    const newObj = {
      sender: {
        _id: authUser._id,
        username: authUser.username,
      },
      message: inputMessage,
      time: `${xyz.getHours().toString().padStart(2, "0")}:${xyz
        .getMinutes()
        .toString()
        .padStart(2, "0")}`,
      date: `${xyz.getDate()} ${monthNames[xyz.getMonth()]} ${xyz
        .getFullYear()
        .toString()
        .slice(-2)}`,
      groupChatID: id,
      imgURL: fileURL,
    };
    const a = [...messages, newObj];
    SetMessages(a);
    SetMessage("");
  };

  const startListening = () => {
    if (listening) {
      return;
    }

    if (
      listenerRef.current &&
      typeof listenerRef.current.startListening === "function"
    ) {
      listenerRef.current.startListening();
      setListening(true);
    } else {
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
        SetLis(false);
      } else {
        console.error("stopListening method is not available");
      }
    } catch (err) {
      console.error("Failed to stop listening: ", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    socket.on("connect", () => {
      // console.log(`connected ${socket.id}`);
    });

    socket.on("recive", (data) => {
      if (data.roomNumber === id) {
        const sound = new Audio(audio);
        sound.play();
        SetMessages((previousMessages) => [...previousMessages, data.obj]);
      }
    });

    return () => {
      socket.off("recive");
    };
  }, []);

  return (
    <>
      <div className="page-home">
        <div className="page-container">
          <div className="single-msg-header">
            <span
              title="back"
              onClick={() => {
                navigate("/groupChat");
              }}
            >
              ←
            </span>
            <img
              src={details.pic}
              style={{ margin: "10px", cursor: "pointer" }}
              onClick={() => {
                navigate(`/singleGroupChat/detail/${id}`);
              }}
              alt="img"
            />
            <div
              style={{ cursor: "pointer" }}
              onClick={() => {
                navigate(`/singleGroupChat/detail/${id}`);
              }}
            >
              <p style={{ fontSize: "1em", opacity: 1 }}>{details.name}</p>
              <p style={{ fontSize: "0.7em", opacity: 0.8 }}>
                Admin - {details.admin.username}
              </p>
            </div>
          </div>
          <div className="single-msg-con" ref={containerRef}>
            {messages.length === 0 ? (
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
                            msg.comp?"comp":msg.sender._id === authUser._id
                              ? "sender"
                              : "reciver"
                          }
                        >
                          {msg.comp?null:msg.sender._id !== authUser._id ? (
                            <>
                              <p style={{ fontSize: "0.75em" }}>
                                {msg.sender.username}
                              </p>
                            </>
                          ) : null}
                          <p
                            style={{
                              fontSize: `${
                                msg.sender._id === authUser._id
                                  ? "1em"
                                  : "1.2em"
                              }`,
                            }}
                          >
                            {msg.message}
                          </p>
                          <div>
                            <p>{msg.date}</p>
                            <p>{msg.time}</p>
                          </div>
                        </div>
                      ) : (
                        <div
                          key={i}
                          className={
                            msg.comp?"comp":msg.sender._id === authUser._id
                              ? "sender"
                              : "reciver"
                          }
                        >
                          {msg.comp?null:msg.sender._id !== authUser._id ? (
                            <>
                              <p style={{ fontSize: "0.75em" }}>
                                {msg.sender.username}
                              </p>
                            </>
                          ) : null}
                          <div style={{ position: "relative" }}>
                            <img
                              src={msg.imgURL}
                              alt="img"
                              style={{
                                padding: "5px 0px 5px 10px",
                                height: "350px",
                                width: "350px",
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

                          <p
                            style={{
                              fontSize: `${
                                msg.sender._id === authUser._id
                                  ? "1em"
                                  : "1.2em"
                              }`,
                            }}
                          >
                            {msg.message}
                          </p>
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
                          msg.comp?"comp":msg.sender._id === authUser._id ? "sender" : "reciver"
                        }
                      >
                        {msg.comp?null:msg.sender._id !== authUser._id ? (
                          <>
                            <p style={{ fontSize: "0.75em" }}>
                              {msg.sender.username}
                            </p>
                          </>
                        ) : null}
                        <p
                          style={{
                            fontSize: `${
                              msg.sender._id === authUser._id ? "1em" : "1.2em"
                            }`,
                          }}
                        >
                          {msg.message}
                        </p>
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
