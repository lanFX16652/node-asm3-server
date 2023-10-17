import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: Number
    },
    orders: {
        type: [Schema.Types.ObjectId],
        ref: 'order'
    },
    role: {
        type: String, // customer | saler | admin
        default: 'customer',
    }
});

export default mongoose.model("user", userSchema);