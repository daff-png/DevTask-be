import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim:  true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim:  true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ['PM', 'Frontend', 'Backend', 'QA', 'DevOps'],
            required: true
        },
    },
    { timestamps: true }
)

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function(candidate) {
    return bcrypt.compare(candidate, this.password)
}

export default mongoose.model('User', userSchema)