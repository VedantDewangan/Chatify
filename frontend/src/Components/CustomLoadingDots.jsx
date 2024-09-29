import React from 'react';
import "../pages/Auth.css"

export const CustomLoadingDots = ({ color }) => {
  return (
    <div style={styles.dotContainer}>
      <span style={{ ...styles.dot, backgroundColor: color, animationDelay: '0s' }}></span>
      <span style={{ ...styles.dot, backgroundColor: color, animationDelay: '0.2s' }}></span>
      <span style={{ ...styles.dot, backgroundColor: color, animationDelay: '0.4s' }}></span>
    </div>
  );
};

const styles = {
  dotContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: '8px',
    height: '8px',
    margin: '0 4px',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'wave 0.8s infinite ease-in-out',
  },
};