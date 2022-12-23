import express, { application } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/users.js"
import authRoutes from "./routes/auth.js";
import artworkRoutes from "./routes/artworks.js";
import cookieParser from "cookie-parser";

const app = express();
dotenv.config();
const MONGO = "mongodb://localhost:27017/Artsy";

const connect = () => {
  mongoose.set("strictQuery", false);
  mongoose
    .connect(MONGO , {
      useNewUrlParser: true
    })
    .then(() => {
      console.log("Connected to DB");
    })
    .catch((err) => {
      throw err;
    });
};

app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/artworks", artworkRoutes);


//error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong!";
  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

app.listen(5000 , () => {
    connect();
    console.log("Connected on 5000 port !");
})