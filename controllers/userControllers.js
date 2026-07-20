import User from "../models/User.js";

export async function getAllUsers(req, res) {
    try {
        const users = await User.find().select('-password')
        res.json(users)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export async function createUser(req, res) {
    try {
        const body = req.body || {}
        const { name, email, password, role } = body
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        const exists = await User.findOne({ email })
        if (exists) return res.status(400).json({ message: 'Email already registered' })
        
        const user = await User.create({ name, email, password, role })
        res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role })
    } catch (error) {
        if ( error.name === 'ValidationError' ) {
            return res.status(400).json({ message: error.message })
        }
        res.status(500).json({ message: error.message })
    }
}

export async function deleteUser(req, res) {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        if (!user) return res.status(404).json({ message: 'User not found' })
            res.status(204).end()
    } catch (error) {
        res.status(400).json({ message: 'Invalid user ID' })
    }
}