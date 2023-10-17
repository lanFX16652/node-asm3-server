import mongoose, { Types } from "mongoose";

const Schema = mongoose.Schema;


const ChatSchema = new Schema({
    messages: {
        type: [{
            author: { type: Types.ObjectId, ref: 'user' },
            authorType: String, //  "Client" | "Admin"
            content: String,
            createdAt: Date
        }],
    }
},
    {
        timestamps: true,
    }
);


export const ChatModel = mongoose.model("chat", ChatSchema);