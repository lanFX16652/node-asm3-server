import mongoose from "mongoose";

const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true
    },
    long_desc: {
        type: String,
        required: true,
    },
    short_desc: {
        type: String,
    },
    img1: {
        type: String
    },
    img2: {
        type: String
    },
    img3: {
        type: String
    },
    img4: {
        type: String
    },
    stock: {
        type: Number,
        default: 10,
    }
})

export default mongoose.model("product", productSchema);