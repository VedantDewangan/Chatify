import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputEmoji from "react-input-emoji";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { TypeAnimation } from "react-type-animation";

export const ChatWithAI = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formattedMessage, setFormattedMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const apiKey = import.meta.env.VITE_API_KEY; // Correct way to access the Vite variable

  // if user is not loggedin then navigate to the login page
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem("chatify")) {
      navigate("/login");
    }
  });

  // taking prompt from user and hhandling its change
  const [inputMessage, setInputMessage] = useState("");
  const handleInputChange = (message) => {
    setInputMessage(message);
  };

  // ref for automatic scrolling
  const containerRef = useRef(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const formatText = (text) => {
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    formattedText = formattedText.replace(/\*(.*?)\*/g, "<em>$1</em>");
    formattedText = formattedText.replace(/(\d+)\.\s+([^\n]+)/g, "<li>$2</li>");
    if (formattedText.includes("<li>")) {
      formattedText = `<ol>${formattedText}</ol>`;
    }
    return formattedText;
  };

  const simulateTyping = (text, callback) => {
    let index = 0;
    const interval = setInterval(() => {
      setFormattedMessage((prev) => prev + text[index]);
      index++;
      if (index === text.length) {
        clearInterval(interval);
        callback && callback();
        setIsTyping(false);
      }
    }, 20);
  };

  const generate = async (geminiModel) => {
    setLoading(true);
    try {
      const prompt = inputMessage;
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response.text();
      const formattedResponse = formatText(response);
      setIsTyping(true);
      simulateTyping(formattedResponse, () => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            message: formattedResponse,
          },
        ]);
        setFormattedMessage("");
      });
    } catch (error) {
      toast.error("someting went wrong", { position: "top-right" });
      console.log("response error", error);
    }
    setLoading(false);
  };

  const SendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() === "") {
      return;
    }
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        message: inputMessage,
      },
    ]);
    setInputMessage("");
    const gemini_api_key = apiKey;
    const googleAI = new GoogleGenerativeAI(gemini_api_key);
    const geminiConfig = {
      temperature: 0.9,
      topP: 1,
      topK: 1,
      maxOutputTokens: 4096,
    };
    const geminiModel = googleAI.getGenerativeModel({
      model: "gemini-pro",
      geminiConfig,
    });
    await generate(geminiModel);
  };

  return (
    <>
      <div className="page-home">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="page-container">
            <div>
              <div
                className="animation-container"
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: "1.6em",
                  padding: "10px 0px 5px 0px",
                  fontWeight: "600",
                }}
              >
                <TypeAnimation
                  sequence={["Hello", 1000, "Welcome to Chatify", 2000]}
                  wrapper="span"
                  cursor={true}
                  repeat={0}
                />
              </div>
              <p
                style={{ textAlign: "center", color: "white", opacity: "0.8" }}
              >
                Don't worry we won't save your data so feel free to use our AI
                Model.{" "}
                <Link className="lonk" to={"/message"}>
                  Go Back
                </Link>
              </p>
            </div>
            <div className="single-msg-con" ref={containerRef}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={msg.sender === "ai" ? "reciver" : "sender"}
                  style={{ padding: "6px 12px 8px 12px" }}
                  dangerouslySetInnerHTML={{ __html: msg.message }}
                />
              ))}
              {isTyping && (
                <div
                  className="reciver"
                  style={{ padding: "6px 12px 8px 12px", color: "lightgrey" }}
                >
                  <span
                    dangerouslySetInnerHTML={{ __html: formattedMessage }}
                  />
                </div>
              )}
              <div
                className="loader"
                style={{
                  visibility: loading ? "visible" : "hidden",
                  color: "white",
                  textAlign: "center",
                  marginBottom: "10px",
                  padding: "0px 0px 10px 0px",
                }}
              ></div>
            </div>
            <div
              className="single-msg-inp"
              style={{ display: "flex", alignItems: "center" }}
            >
              <form onSubmit={SendMessage}>
                <InputEmoji
                  placeholder="Type a message"
                  title="Write Message"
                  value={inputMessage}
                  onChange={handleInputChange}
                />
                <button type="submit" title="Send Message">
                  ➤
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};
