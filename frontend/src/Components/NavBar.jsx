import React from "react";
import { useNavigate } from "react-router-dom";

export const NavBar = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="page-conatiner-1">
        <button
          onClick={() => {
            navigate("/");
          }}
        >
          HOME
        </button>
        <button
          onClick={() => {
            navigate("/message");
          }}
        >
          MESSAGE
        </button>
        <button
          onClick={() => {
            navigate("/groupChat");
          }}
        >
          GROUP CHAT
        </button>
      </div>
    </>
  );
};
