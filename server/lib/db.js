import mongoose from "mongoose";

//function to connect to the mongodb databade

export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Database connected")
    );

    await mongoose.connect(
      `${process.env.MONGODB_URI}/SIPHRA`
    );
  } catch (error) {
    console.log(error);
  }
};
