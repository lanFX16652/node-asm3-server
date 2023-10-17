import userModel from "../models/userModel.js"
import bcrypt from "bcryptjs";

export const authMiddleware = async (req, res, next) => {
    if (req.user) {
        return next()
    }

    const user = await userModel.findOne({
        email: req.body.email
    })

    let userValid = false

    if (user) {
        userValid = await bcrypt
            .compare(req.body.password, user.password)

        req.user = user
    }

    if (!userValid) {
        return res.status(403).json({ message: 'Forbidden error' })
    }

    if (user.role === 'customer') {
        return res.status(403).json({ message: 'Forbidden error' })
    }

    next()
}