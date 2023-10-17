import mongoose from "mongoose";

const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "user"
    }
});

export default mongoose.model("session", sessionSchema);