import React, { useState, useEffect, useRef } from "react";
import logo from "../public/logo.png";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { CustomLoadingDots } from "../Components/CustomLoadingDots";
import {
  Input,
  InputGroup,
  Button,
  InputRightElement,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import "./Auth.css";
import image from "../public/inputImage.png";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export const Signup = () => {
  // if user is login in then navigate to the home page and fetch the user details
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  useEffect(() => {
    if (localStorage.getItem("chatify")) {
      navigate("/");
    }
  });

  // for password management
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);

  // user details
  const [inputData, SetInputData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
  });
  const [value, setValue] = React.useState("male");

  // change the user input
  const handleChange = (e) => {
    SetInputData({
      ...inputData,
      [e.target.name]: e.target.value,
    });
  };

  // hadling the profile image
  const inputRef = useRef(null); // ref from input
  const uploadPhoto = () => {
    inputRef.current.click();
  }; // handling event from ref to the selected

  // change the file profile pic to object (file)
  const [profilepic, setProfilepic] = useState("");
  const profilepicChange = (event) => {
    const file = event.target.files[0];
    if(file.type==="image/png" || file.type==="image/jpg" || file.type==="image/jpeg"){
      setProfilepic(file);
      return;
    }
    toast.error("Cannot upload selected file",{position:"top-right"});    
  };

  // handlign the signup button ad loading state
  const [loading, SetLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    SetLoading(true);
    try {
      let profilepicUrl = profilepic;

      // If a new profile picture is provided, upload to Cloudinary
      if (profilepic !== "" && !(typeof profilepic === "string")) {
        const data = new FormData();
        data.append("file", profilepic);
        data.append("upload_preset", "chatify");
        data.append("cloud_name", "do1lffrun");

        // Wait for Cloudinary upload to complete
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/do1lffrun/image/upload",
          {
            method: "POST",
            body: data,
          }
        );
        const cloudinaryData = await res.json();
        if (cloudinaryData.url) {
          profilepicUrl = cloudinaryData.url; // Set URL from Cloudinary
        } else {
          throw new Error("Image upload failed");
        }
      }
      if(inputData.name.length<=2){
        toast.error("Enter correct Full Name",{position:"top-right"});
        return;
      }
      if(inputData.username.length<=4){
        toast.error("Username should contain atleast 5 character",{position:"top-right"});
        return;
      }
      if(inputData.password.length<=7){
        toast.error("Password should contain atleast 8 character",{position:"top-right"});
        return;
      }
      // Now that the profile pic is uploaded, send data to backend
      const { data } = await axios.post(
        "https://chatify-wols.onrender.com/api/register",
        {
          name: inputData.name,
          username: inputData.username,
          email: inputData.email,
          gender: value,
          profilepic: profilepicUrl,
          password: inputData.password,
        },
        { withCredentials: true }
      );
      if (data.register) {
        localStorage.setItem("chatify", JSON.stringify(data.UserDetails));
        setAuthUser(data.UserDetails);
        toast.success(data.msg, {
          position: "top-right",
        });
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Something went wrong", {
        position: "top-right",
      });
    }
    SetLoading(true);
  };

  return (
    <>
      <div className="signup page auth" style={{ overflowX: "hidden" }}>
        <motion.div
          initial={{ opacity: 0, y: -100 }} // Starting state
          animate={{ opacity: 1, y: 0 }} // End state
          transition={{ duration: 0.8 }} // Animation duration
        >
          <img src={logo} className="logo" />
          <div className="auth-container">
            <p className="auth-p">Create a New Account</p>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-input">
                <p>
                  Enter Email <span className="star">*</span>{" "}
                </p>
                <Input
                  value={inputData.email}
                  name="email"
                  autoComplete="off"
                  onChange={handleChange}
                  type="email"
                  required
                />
              </div>
              <div
                className="auth-input"
                style={{ display: "flex", gap: "20px" }}
              >
                <div>
                  <p>
                    Enter Full Name <span className="star">*</span>{" "}
                  </p>
                  <Input
                    value={inputData.name}
                    name="name"
                    autoComplete="off"
                    onChange={handleChange}
                    type="text"
                    required
                  />
                </div>
                <div>
                  <p>
                    Enter Username <span className="star">*</span>{" "}
                  </p>
                  <Input
                    value={inputData.username}
                    name="username"
                    autoComplete="off"
                    onChange={handleChange}
                    type="text"
                    required
                  />
                </div>
              </div>
              <div className="auth-input">
                <p>
                  Enter Password <span className="star">*</span>{" "}
                </p>
                <InputGroup size="md">
                  <Input
                    pr="4.5rem"
                    type={show ? "text" : "password"}
                    placeholder="Enter password"
                    value={inputData.password}
                    name="password"
                    autoComplete="off"
                    onChange={handleChange}
                    required
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleClick}>
                      {show ? "Hide" : "Show"}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </div>
              <div
                className="auth-input"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-around",
                }}
              >
                <div>
                  <p>
                    Select Your Gender <span className="star">*</span>{" "}
                  </p>
                  <RadioGroup onChange={setValue} value={value}>
                    <Stack direction="row">
                      <Radio value="male">Male</Radio>
                      <Radio value="female">Female</Radio>
                    </Stack>
                  </RadioGroup>
                </div>
                <div
                  style={{ height: "75px", width: "150px", cursor: "pointer" }}
                  title="Upload your photo"
                  onClick={uploadPhoto}
                >
                  <>
                    {profilepic instanceof File ? (
                      <img
                        style={{
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "centre",
                        }}
                        src={URL.createObjectURL(profilepic)}
                      />
                    ) : (
                      <img
                        style={{
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "centre",
                        }}
                        src={image}
                      />
                    )}
                  </>
                  <input
                    ref={inputRef}
                    onChange={profilepicChange}
                    style={{ display: "none" }}
                    type="file"
                  />
                </div>
              </div>
              <div className="auth-links">
                <Link className="auth-link" to={"/login"}>
                  Already have a account ?
                </Link>
              </div>
              <Button isDisabled={loading} type="submit">
                {loading ? (
                  <CustomLoadingDots color={"darkgray"} />
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
};
