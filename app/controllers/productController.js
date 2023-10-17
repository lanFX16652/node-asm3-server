
import mongoose from 'mongoose'
import ProductModel from '../models/productModel.js'
import { MediaModel } from '../models/mediaModel.js';
import fs from 'fs'
import { config } from '../config/config.js';

const ObjectId = mongoose.Types.ObjectId
const category = [
    {
        name: "apple",
        image: `${config.baseUrl}/product_1.png`,
    },
    {
        name: "iphone",
        image: `${config.baseUrl}/product_2.png`,
    },
    {
        name: "ipad",
        image: `${config.baseUrl}/product_3.png`,
    },
    {
        name: "watch",
        image: `${config.baseUrl}/product_4.png`,
    },
    {
        name: "airpods",
        image: `${config.baseUrl}/product_5.png`,
    },
];

const getProducts = async (req, res, next) => {
    const { page, limit, search } = req.query

    const findOptions = search ? {
        name: {
            $regex: search,
            $options: 'i'
        }
    } : {}

    try {
        const products = await ProductModel.find(findOptions).skip((page - 1) * limit).limit(limit)
        const totalProducts = await ProductModel.count(findOptions)
        const totalPage = totalProducts / +limit

        return res.json({ products, totalProducts, totalPage, page })
    } catch (error) {
        next(error)
    }
}

const createProduct = async (req, res, next) => {
    if (isNaN(req.body.price)) {
        return next(new Error('price is not valid'))
    }

    const { mediaIds } = req.body
    const images = await MediaModel.find({
        _id: {
            $in: mediaIds
        }
    })

    //create product
    const newProduct = new ProductModel({
        name: req.body.name,
        price: +req.body.price,
        category: req.body.category,
        stock: req.body.stock,
        long_desc: req.body.long_desc,
        short_desc: req.body.short_desc,
        img1: `${config.baseUrl}/uploads/${images[0].name}`,
        img2: `${config.baseUrl}/uploads/${images[1].name}`,
        img3: `${config.baseUrl}/uploads/${images[2].name}`,
        img4: `${config.baseUrl}/uploads/${images[3].name}`,
    })

    //save to database
    try {
        const product = await newProduct.save();
        //return database
        return res.status(200).json({ product: product })
    } catch (error) {
        next(error)
    }
}

const getProductDetail = async (req, res, next) => {
    try {
        const id = req.params.id
        const productDetail = await ProductModel.findById(id)
        res.status(200).json(productDetail)
    } catch (error) {
        next(error)
    }
}

const getRelatedProduct = async (req, res, next) => {
    const category = req.query.category;
    const productId = req.query.id;


    try {
        const relatedProducts = await ProductModel.find({
            category: {
                $eq: category
            },
            _id: {
                $ne: new ObjectId(productId)
            }
        })

        // const relatedProducts = await ProductModel.aggregate([
        //     {
        //         $match: {
        //             category: {
        //                 $eq: category
        //             }
        //         }
        //     },
        //     {
        //         $match: {
        //             _id: {
        //                 $ne: new ObjectId('64aea5e066b6bea8a0b4d8ea')
        //             }
        //         }
        //     }
        // ])

        return res.status(200).json(relatedProducts)
    } catch (error) {
        next(error)
    }
}

const getCategory = async (req, res) => {
    res.json({ category: category })
}


const postEditProduct = async (req, res) => {
    const productId = req.body.productId;
    const values = req.body.values;

    const updatedProduct = await ProductModel.findByIdAndUpdate(productId, values, {
        new: true
    })
    res.status(200).json(updatedProduct);
}

const deleteProduct = async (req, res, next) => {
    const productId = req.body.productId;
    try {
        const product = await ProductModel.findById(productId);
        await product.deleteOne()

        const productMedias = [product.img1, product.img2, product.img3, product.img4]
        await MediaModel.deleteMany({
            name: {
                $in: productMedias.map(i => i.split(`${config.baseUrl}/uploads/`).pop())
            }
        })

        productMedias.forEach(media => {
            const fileName = media.split(`${config.baseUrl}/uploads/`).pop()

            if (fs.existsSync(`${process.cwd()}/public/uploads/${fileName}`)) {
                fs.unlinkSync(`${process.cwd()}/public/uploads/${fileName}`)
            }
        })
        res.status(200).json(product);
    } catch (err) {
        next(err)
    }
}

export { getProducts, createProduct, getProductDetail, getRelatedProduct, getCategory, postEditProduct, deleteProduct };