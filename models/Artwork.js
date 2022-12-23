import mongoose from "mongoose";


const ArtworkSchema = new mongoose.Schema(
    {
        artistId: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        startdate: {
            type: String,
            required: true,
        },
        enddate: {
            type: String,
            required: true,
        },
        baseprice: {
            type: String,
            required: true,
        },
        category: {
            type: String,
        },
        description: {
            type: String,
        },
        fromGoogle: {
            type: Boolean,
            default: false,
          },

    }
);

export default mongoose.model("Artworks", ArtworkSchema);
