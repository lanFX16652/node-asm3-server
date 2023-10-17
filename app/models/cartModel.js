import mongoose from "mongoose";

const Schema = mongoose.Schema;

const cartModel = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
    products: [
        {
            product: Object,
            qty: { type: Number, default: 0 }
        },
    ],
});

export default mongoose.model("cart", cartModel);