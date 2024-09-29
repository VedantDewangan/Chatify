import React from "react";
import { motion } from "framer-motion";

export const NotFoundPage = () => {
  return (
    <div className="page" style={styles.page}>
      <motion.div
        initial={{ opacity: 0, y: -100 }} // Starting state
        animate={{ opacity: 1, y: 0 }} // End state
        transition={{ duration: 0.8 }} // Animation duration
      >
        <div className="notFoundPage" style={styles.notFoundPage}>
          <h1 style={styles.header}>404</h1>
          <p style={styles.message}>
            Oops! Looks like you're lost in space. 🚀 <br />
            This page is as empty as your fridge on a Sunday night. 🥶
          </p>
          <button style={styles.button} onClick={() => window.history.back()}>
            Go Back Before It's Too Late! 🏃‍♂️💨
          </button>
          <div style={styles.emoji}>
            <span role="img" aria-label="confused emoji">
              😕
            </span>
            <span role="img" aria-label="alien emoji">
              👽
            </span>
            <span role="img" aria-label="robot emoji">
              🤖
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    height: "100vh",
    padding: "4.8vh 0vh 0vh 0vh",
    backgroundColor: "#000",
  },
  notFoundPage: {
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    color: "#fff",
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "#3a3a3a",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
  },
  header: {
    fontSize: "62px",
    margin: "0",
  },
  message: {
    fontSize: "14px",
    margin: "20px 0",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "rgb(78, 155, 254)",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
  },
  emoji: {
    marginTop: "20px",
    fontSize: "24px",
  },
};
