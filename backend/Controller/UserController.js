const { User } = require("../DataBase/Model/UserModel");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { jwtToken } = require("../utils/jwtToken");

dotenv.config();

const register = async (req, res) => {
  try {
    const { name, username, email, password, profilepic, gender } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const errorMsg =
        existingUser.email === email
          ? "Email is already registered"
          : "Username is not available";

      return res.status(400).send({
        register: false,
        msg: errorMsg,
      });
    }

    let finalPic = profilepic;
    if (finalPic == "") {
      finalPic =
        gender === "male"
          ? `https://avatar.iran.liara.run/public/boy?username=${username}`
          : `https://avatar.iran.liara.run/public/girl?username=${username}`;
    }

    const hashPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      name,
      email,
      username,
      password: hashPassword,
      profilepic: finalPic,
      gender,
    });

    await newUser.save();

    jwtToken(newUser._id, res);

    res.status(201).send({
      register: true,
      msg: "New account created successfully",
      UserDetails: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        gender: newUser.gender,
        profilepic: newUser.profilepic,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      register: false,
      msg: "Server error. Please try again later.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const user = await User.findOne({
      email: email,
      username: username,
    });

    if (!user) {
      return res.status(400).send({
        login: false,
        msg: "Invalid email or username",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).send({
        login: false,
        msg: "Incorrect password",
      });
    }

    jwtToken(user._id, res);

    return res.status(200).send({
      login: true,
      msg: "Login successful",
      UserDetails: {
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        gender: user.gender,
        profilepic: user.profilepic,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      login: false,
      msg: "Server error. Please try again later.",
    });
  }
};

const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
    });
    res.status(200).send({
      logout: true,
      msg: "User Logout",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      login: false,
      msg: "Server error. Please try again later.",
    });
  }
};

const newPassword = async (req, res) => {
  try {
    const { newPassword, username } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.findOneAndUpdate(
      {
        username: username,
      },
      {
        password: hashedPassword,
      }
    );
    res.status(200).send({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      msg: "internal error",
    });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const user = await User.findOne({
      email: email,
      username: username,
    });

    if (!user) {
      return res.status(400).send({
        login: false,
        msg: "Invalid email or username",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.updateOne(
      {
        email: email,
        username: username,
      },
      {
        password: hashedPassword,
      }
    );

    res.status(200).send({
      updated: true,
      msg: "Your Password is updated",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      login: false,
      msg: "Server error. Please try again later.",
    });
  }
};

const changeProfilePic = async (req, res) => {
  try {
    const { username, newProfilePic } = req.body;
    await User.findOneAndUpdate(
      {
        username: username,
      },
      {
        profilepic: newProfilePic,
      }
    );
    res.status(200).send({
      success: true,
      msg: "profile pic changes successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      msg: "Server error. Please try again later.",
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  forgetPassword,
  newPassword,
  changeProfilePic,
};
