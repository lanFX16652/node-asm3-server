import cartModel from "../models/cartModel.js";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import { parseCurrency } from "../../utils/index.js";
import nodemailer from "nodemailer";
import { config } from "../config/config.js";

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: config.transporterUser,
        pass: config.transporterPass,
    },
});

export const addProductIntoCart = async (req, res, next) => {
    const { qty, productId } = req.body;

    if (req.user) {
        try {
            let userCart = await cartModel.findOne({ userId: req.user });

            //   logic cho user da co cart
            if (userCart) {
                // tim index cua product trong array product cua cart user
                const productInCartIndex = userCart.products.findIndex(
                    (p) => p.product._id.toString() === productId
                );

                if (productInCartIndex === -1) {
                    // neu khong co thi them product moi vao cart user
                    userCart.products = [
                        ...userCart.products,
                        {
                            product: await productModel.findById(productId),
                            qty,
                        },
                    ];
                } else {
                    // neu co thi tim product trong array cart user de tang qty
                    userCart.products = userCart.products.map((p) => {
                        if (p.product._id.toString() === productId) {
                            p.product.qty += qty;
                        }
                        return p;
                    });
                }
                await userCart.save();
            } else {
                // logic cho user chua co cart
                userCart = await cartModel.create({
                    userId: req.user._id,
                    products: [
                        {
                            product: await productModel.findById(productId),
                            qty,
                        },
                    ],
                });

                await userCart.save();
            }
            res.status(200).json({
                cart: userCart.products,
                totalCartItem: userCart.products.reduce((prev, product) => {
                    return prev + product.qty;
                }, 0),
                totalPrice: userCart.products.reduce((prev, product) => {
                    return prev + product.product.price * product.qty;
                }, 0),
            });
        } catch (error) {
            next(error);
        }
    } else {
        res.status(400).json({
            message: "Required login!",
        });
    }
};

export const getCartUser = async (req, res, next) => {
    if (req.user) {
        try {
            const userCart = await cartModel.findOne({ userId: req.user._id });
            return res.status(200).json({
                cart: userCart?.products ? userCart.products : [],
                totalCartItem: userCart?.products
                    ? userCart.products.reduce((prev, product) => {
                        return prev + product.qty;
                    }, 0)
                    : 0,
                totalPrice: userCart?.products
                    ? userCart.products.reduce((prev, product) => {
                        return prev + product.product.price * product.qty;
                    }, 0)
                    : 0,
            });
        } catch (error) {
            return next(error);
        }
    } else {
        res.status(400).json({
            message: "Please login!",
        });
    }
};

export const cartOrder = async (req, res, next) => {
    const { fullname, email, phoneNumber, address, cart, totalPrice } = req.body;

    const itemsCheckStock = await Promise.all(cart.map(productOrder => {
        return productModel.findById(productOrder.product._id);
    }))

    const itemsOutOfStock = itemsCheckStock.map(product => {
        if (product.stock === 0) {
            return {
                productName: product.name,
            }
        }
    }).filter(Boolean)

    if (itemsOutOfStock.length) {
        return res.json({
            message: 'Order have product out of stock',
            products: itemsOutOfStock
        })
    }

    const cartToProcess = []

    cart?.forEach(product => {
        for (const productInDB of itemsCheckStock) {
            if (productInDB._id.toString() === product.product._id) {
                cartToProcess.push({
                    product: productInDB,
                    qty: productInDB.stock < product.qty ? productInDB.stock : product.qty
                })
            }
        }
    })

    if (cartToProcess.length) {
        const newOrder = await orderModel.create({
            fullname: fullname,
            email: email,
            phoneNumber: phoneNumber,
            address: address,
            cart: cartToProcess,
            totalPrice: totalPrice,
            userId: req.user._id,
        });

        await Promise.all(cartToProcess.map(p => productModel.findByIdAndUpdate(p.product._id, {
            stock: p.product.stock - p.qty
        })))

        await cartModel.deleteOne({ userId: req.user._id });

        const user = req.user;

        let tableProductTemplate = ''
        const attachments = []

          newOrder.cart
          .forEach(
            (item) => {
                attachments.push({
                    filename: item.product.img1,
                    path: item.product.img1,
                    cid: item.product._id.toString()
                })
                tableProductTemplate +=  `
                            <tr>
                                <td>${item.product.name}</td>
                                <td><img src="cid:${item.product._id.toString()}" alt="${item.product.name}" /></td>
                                <td>${parseCurrency(item.product.price)}</td>
                                <td>${item.qty}</td>
                                <td>${parseCurrency(item.qty * item.product.price)}</td>
                            </tr>
                        `}
          )
        console.log(tableProductTemplate)
        let mailOptions = {
            to: email, // Địa chỉ email người nhận
            subject: `Order ${newOrder._id} from Ecommerce Shop`, // Tiêu đề email
            attachments: attachments ,
            html: ` <html>
                <head>
                    <style>
                        table,
                        th,
                        td {
                        border: 1px solid;
                        text-align: center;
                        }
                        img {
                        width: 100px;
                        }
                    </style>
                </head>
                <body>
                    <h1>Xin Chào User ${user._id} </h1>
                    <h5>Phone ${phoneNumber}</h5>
                    <h5>Address ${address} </h5>
                    <table>
                        <tr>
                            <th>Tên sản phẩm</th>
                            <th>Hình ảnh</th>
                            <th>Giá</th>
                            <th>Số lượng</th>
                            <th>Thành tiền</th>
                        </tr>
                        ${tableProductTemplate}
                    </table >

    <h4>Tổng thanh toán: ${parseCurrency(totalPrice)}<h4>
        <h5>Cảm Ơn Bạn</h5>
    </body>
    </html>`, // Nội dung email
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: " + info.response);
            }
        });
        const order = newOrder.toObject();
        return res.status(200).json({
            order: {
                ...order,
                status: "Waiting for pay",
                delivery: "Waiting for processing",
            },
        });
    } else {
        res.status(400).json({
            message: "Your cart is empty",
        });
    }
};

export const getOrder = async (req, res) => {
    if (req.user) {
        try {
            const orders = await orderModel.find({ userId: req.user._id });
            res.json({
                orders: orders.map((order) => {
                    const objectOrder = order.toObject();
                    return {
                        ...objectOrder,
                        status: "Waiting for pay",
                        delivery: "Waiting for processing",
                    };
                }),
            });
        } catch (error) {
            console.log(error);
        }
    } else {
        res.status(400).json({ message: "Please Login!" });
    }
};

export const getOrderDetail = async (req, res) => {
    try {
        const orderDetail = await orderModel.findById(req.params.id);
        return res.status(200).json(orderDetail);
    } catch (error) {
        console.log(error);
    }
};

export const getAllOrders = async (req, res) => {
    const { page, limit } = req.query;
    try {
        const allOrders = await orderModel
            .find({})
            .skip((page - 1) * limit)
            .limit(limit);
        const totalOrders = await orderModel.count();
        const totalPage = totalOrders / +limit;
        const allOrderTransform = allOrders.map((order) => {
            const objectOrder = order.toObject();
            return {
                ...objectOrder,
                status: "Chưa thanh toán",
                delivery: "Chưa vận chuyển",
            };
        });

        return res
            .status(200)
            .json({ allOrderTransform, totalOrders, totalPage, page });
    } catch (error) {
        console.log(error);
    }
};
