import { useContext, createContext, useState } from "react";

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  const obj = {
    name:"",
    profilepic:""
  }
  const [authUser, setAuthUser] = useState(
    JSON.parse(localStorage.getItem("chatify")) || obj
  );

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// it is used so that we can use localstorage data everywhere in our application
