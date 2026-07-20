import jwt from "jsonwebtoken"
import User from "../models/User.js"

function signToken(user) {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    )
}

export async function login(req, res) {
    try {
        const body = req.body || {}
        const { email, password } = body
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' })
        }

        const user = await User.findOne({ email }).select('+password')
        if (!user) return res.status(401).json({ message: 'Invalid email or password' })

        const isMatch = await user.comparePassword(password)
        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' })

        const token = signToken(user)
        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

export async function getMe(req, res) {
    res.json({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
    })
}