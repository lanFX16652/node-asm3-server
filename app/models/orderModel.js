import mongoose from "mongoose";

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    fullname: String,
    email: String,
    phoneNumber: String,
    address: String,
    userId: String,
    cart: [
        {
            product: Object,
            qty: { type: Number, default: 0 }
        },
    ],
    totalPrice: Number,
},
    {
        timestamps: true,
    }
);

export default mongoose.model("order", orderSchema);