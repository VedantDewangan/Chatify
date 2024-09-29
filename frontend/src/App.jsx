import React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { ForgetPassword } from "./pages/ForgetPassword";
import { NotFoundPage } from "./pages/NotFoundPage";
import { VerifyUsers } from "./utils/VerifyUsers";
import { AllMessage } from "./pages/AllMessage";
import { SingleMessage } from "./pages/SingleMessage";
import { GroupChat } from "./pages/GroupChat";
import { SingleGroupChat } from "./pages/SingleGroupChat";
import { ChatWithAI } from "./pages/ChatWithAI";
import { SingleGroupChatDetail } from "./pages/SingleGroupChatDetail";

export const App = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgetPassword" element={<ForgetPassword />} />
        <Route element={<VerifyUsers />} />
        <Route path="/" element={<Home />} />
        <Route path="/message" element={<AllMessage />} />
        <Route path="/message/:id" element={<SingleMessage />} />
        <Route path="/groupChat" element={<GroupChat />} />
        <Route path="/singleGroupChat/:id" element={<SingleGroupChat />} />
        <Route path="/chatWithAI" element={<ChatWithAI />} />
        <Route path="/singleGroupChat/detail/:id" element={<SingleGroupChatDetail />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};
