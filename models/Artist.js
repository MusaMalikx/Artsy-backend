import mongoose from "mongoose";


const ArtistSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
          },
          email: {
            type: String,
            required: true,
            unique: true,
          },
          password: {
            type: String,
          },
          fromGoogle: {
            type: Boolean,
            default: false,
          },
          experience: {
            type: String,
          },
          address: {
            type: String,
          },
    },
    { timestamps: true }
);

export default mongoose.model("Artist", ArtistSchema);