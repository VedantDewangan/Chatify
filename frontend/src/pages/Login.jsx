import React, { useEffect, useState } from "react";
import logo from "../public/logo.png";
import {
  Input,
  InputGroup,
  Button,
  InputRightElement,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import "./Auth.css";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { CustomLoadingDots } from "../Components/CustomLoadingDots";

export const Login = () => {
  // if user is already login then navigate to the home page and getting user details
  const { setAuthUser } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("chatify")) {
      navigate("/");
    }
  });

  // managing the password for its type of either text or password
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);

  // user input data
  const [inputData, SetInputData] = useState({
    email: "",
    username: "",
    password: "",
  });

  // handling the changes when user input something
  const handleChange = (e) => {
    SetInputData({
      ...inputData,
      [e.target.name]: e.target.value,
    });
  };

  // loading for login the user and handling the submit form
  const [loginLoading, SetLoginLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    SetLoginLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:3000/api/login",
        inputData,
        { withCredentials: true }
      );
      if (data.login) {
        toast.success(data.msg, {
          position: "top-right",
        });
        localStorage.setItem("chatify", JSON.stringify(data.UserDetails));
        setAuthUser(data.UserDetails);
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response.data.msg, {
        position: "top-right",
      });
    }
    SetLoginLoading(false);
  };

  // loading state for login and function if user want to login we the guest ID
  const [LoginwithCredential, SetLoginwithCredential] = useState(false);
  const LoginwithCredentials = async () => {
    SetLoginwithCredential(true);
    try {
      const { data } = await axios.post(
        "http://localhost:3000/api/login",
        {
          email: "test1@gmail.com",
          username: "test_01",
          password: "123123123",
        },
        { withCredentials: true }
      );
      if (data.login) {
        toast.success(data.msg, {
          position: "top-right",
        });
        localStorage.setItem("chatify", JSON.stringify(data.UserDetails));
        setAuthUser(data.UserDetails);
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response.data.msg, {
        position: "top-right",
      });
    }
    SetLoginwithCredential(false);
  };

  return (
    <>
      <div className="page auth" style={{ overflow: "hidden" }}>
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img src={logo} className="logo" />
          <div className="auth-container" style={{ overflow: "hidden" }}>
            <p className="auth-p">Login</p>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-input">
                <p>
                  Enter Email <span className="star">*</span>{" "}
                </p>
                <Input
                  required
                  value={inputData.email}
                  name="email"
                  autoComplete="off"
                  onChange={handleChange}
                  type="email"
                />
              </div>
              <div className="auth-input">
                <p>
                  Enter Username <span className="star">*</span>{" "}
                </p>
                <Input
                  required
                  value={inputData.username}
                  name="username"
                  autoComplete="off"
                  onChange={handleChange}
                  type="text"
                />
              </div>
              <div className="auth-input">
                <p>
                  Enter Password <span className="star">*</span>{" "}
                </p>
                <InputGroup size="md">
                  <Input
                    required
                    pr="4.5rem"
                    type={show ? "text" : "password"}
                    placeholder="Enter password"
                    value={inputData.password}
                    name="password"
                    autoComplete="off"
                    onChange={handleChange}
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleClick}>
                      {show ? "Hide" : "Show"}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </div>
              <div className="auth-links">
                <Link className="auth-link" to={"/forgetPassword"}>
                  Forget Password
                </Link>
                <Link className="auth-link" to={"/signup"}>
                  Don't have a account ?
                </Link>
              </div>
              <Button type="submit" isDisabled={loginLoading}>
                {loginLoading ? (
                  <CustomLoadingDots color={"darkgray"} />
                ) : (
                  "Login"
                )}
              </Button>
              <Button
                style={{ backgroundColor: "#C80036", color: "white" }}
                onClick={LoginwithCredentials}
                isDisabled={LoginwithCredential}
              >
                {LoginwithCredential ? (
                  <CustomLoadingDots color={"white"} />
                ) : (
                  "Get Guest User Credentials"
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
};
