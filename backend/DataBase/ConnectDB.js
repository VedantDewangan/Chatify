const mongoose = require("mongoose");

const ConnectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("DataBase is connected");
  } catch (error) {
    console.log("DataBase is not Connected");
    console.log(error);
  }
};

module.exports = {
  ConnectDB,
};
