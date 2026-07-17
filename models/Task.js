import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        category: {
            type: String,
            enum: ['Frontend', 'Backend', 'QA', 'DevOps'],
            default: 'Frontend',
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed'],
            default: 'Pending',
        },
    },
    {
        timestamps: true,
    }
)
export default mongoose.model('Task', taskSchema)