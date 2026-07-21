import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
    // accept token from Authorization Bearer header, x-access-token header, or ?token= in query
    const authHeader = req.headers.authorization
    const xAccess = req.headers['x-access-token']
    const queryToken = req.query?.token

    let token = null
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
    } else if (xAccess) {
        token = xAccess
    } else if (queryToken) {
        token = queryToken
    }

    if (!token) {
        console.debug('protect: no token provided (Authorization, x-access-token, or ?token)')
        return res.status(401).json({ message: 'Not authorized, no token' })
    }

    try {
        let decoded
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET)
        } catch (err) {
            console.debug('protect: token verification failed:', err.message)
            return res.status(401).json({ message: 'Not authorized, invalid token' })
        }

        console.debug('protect: decoded token payload:', decoded)
        const user = await User.findById(decoded.id)
        if (!user) {
            console.debug('protect: user not found for id', decoded.id)
            return res.status(401).json({ message: 'User not found' })
        }

        req.user = user
        req.token = token
        console.debug('protect: authenticated user', user._id.toString(), 'role', user.role)
        next()
    } catch (error) {
        console.debug('protect: unexpected error', error && error.message)
        return res.status(401).json({ message: 'Not authorized, invalid token' })
    }
}

export function authorize(...roles) {
    return (req, res, next) => {
        const allowed = roles.map(r => String(r).toLowerCase())
        const userRole = String(req.user.role || '').toLowerCase()
        if (!allowed.includes(userRole)) {
            return res.status(403).json({ message: 'Forbidden: insufficient role' })
        }
        next()
    }
}