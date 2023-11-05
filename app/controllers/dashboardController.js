import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"

export const getInfoBar = async (req, res, next) => {
    try {
        const clientsCount = await userModel.count({
            role: {
                $eq: 'customer'
            }
        })

        const newOrders = await orderModel.count({
            createdAt: {
                $gte: new Date().setHours(0, 0, 0, 0)
            }
        })


        // const [newOrderData] = await orderModel.aggregate([
        //     {
        //         $match: {
        //             createdAt: {
        //                 $gte: new Date('2023-10-01'),
        //                 $lte: new Date('2023-10-30')
        //             }
        //         }
        //     },
        //     {
        //         $group: {
        //             _id: null,
        //             count: { $sum: 1 }
        //         }
        //     }
        // ])

        const [earningsOfMonthData] = await orderModel.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: [{ $month: "$createdAt" }, new Date().getMonth() + 1] },
                            { $eq: [{ $year: "$createdAt" }, new Date().getFullYear()] }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalPrice: {
                        $sum: "$totalPrice"
                    }
                }
            }
        ])
        res.json({
            clientsCount,
            newOrders,
            earningsOfMonth: earningsOfMonthData?.totalPrice ?? 0,
        })

    } catch (error) {
        next(error)
    }
}

