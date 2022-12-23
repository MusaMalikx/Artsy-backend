import express, { application } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import artworkRoutes from "./routes/artworks.js";
import cookieParser from "cookie-parser";

const app = express();
dotenv.config();
const MONGO = process.env.MONGO_URL || "mongodb://localhost:27017/Artsy";

const connect = () => {
  mongoose.set("strictQuery", false);
  mongoose
    .connect(MONGO, {
      useNewUrlParser: true,
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
app.get("/", (req, res) => {
  res.status(200).send("Artsy Api is ROCKING LOL!");
});
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

app.listen(8080, () => {
  connect();
  console.log("Connected on 8080 port!");
});

// Export the Express API
export default app;
