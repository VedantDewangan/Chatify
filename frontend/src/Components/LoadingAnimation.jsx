import React from "react";
import "./Style.css";

export const LoadingAnimation = ({ height }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "20px",
        height: height,
      }}
    >
      <p style={{ fontSize: "1.4em" }}>Loading...</p>
      <div className="loader2"></div>
    </div>
  );
};
