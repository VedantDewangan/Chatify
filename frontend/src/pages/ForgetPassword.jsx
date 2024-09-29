import React, { useEffect, useState } from "react";
import logo from "../public/logo.png";
import {
  Input,
  InputGroup,
  FormLabel,
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

export const ForgetPassword = () => {
  // id user is lalreday login then navigate to home page and getting user data
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  useEffect(() => {
    if (localStorage.getItem("chatify")) {
      navigate("/");
    }
  });

  // it is for password management
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);

  // user input data
  const [inputData, SetInputData] = useState({
    email: "",
    username: "",
    password: "",
  });

  // handling the changes done by user
  const handleChange = (e) => {
    SetInputData({
      ...inputData,
      [e.target.name]: e.target.value,
    });
  };

  // change the passsword and handling the loading state
  const [loading, SetLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    SetLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:3000/api/frogetPassword",
        inputData,
        { withCredentials: true }
      );

      if (data.updated) {
        toast.success(data.msg, {
          position: "top-right",
        });
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response.data.msg, {
        position: "top-right",
      });
    }
    SetLoading(false);
  };

  return (
    <>
      <div className="page auth">
        <motion.div
          initial={{ opacity: 0, y: -100 }} // Starting state
          animate={{ opacity: 1, y: 0 }} // End state
          transition={{ duration: 0.8 }} // Animation duration
        >
          <div className="auth-container">
            <p className="auth-p" style={{ padding: "40px" }}>
              Forget Password
            </p>
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
                  Enter New Password <span className="star">*</span>{" "}
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
                <Link className="auth-link" to={"/login"}>
                  Go Back
                </Link>
              </div>

              <Button type="submit" isDisabled={loading}>
                {loading ? (
                  <CustomLoadingDots color={"darkgray"} />
                ) : (
                  "Change Password"
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
};
