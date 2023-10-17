import mongoose from "mongoose";

const Schema = mongoose.Schema;


const MediaSchema = new Schema({
    filename: {
        type: String,
    },
    mimeType: {
        type: String,
    },
    name: {
        type: String,
    },
},
    {
        timestamps: true,
    }
);


export const MediaModel = mongoose.model("media", MediaSchema);