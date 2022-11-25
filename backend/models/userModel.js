const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter name."],
        maxLength: [30, "Name can not exceed 30 characters"],
        minLength: [4, "Name should be have more than 4 characters"]
    },

    email: {
        type: String,
        required: [true, "Please enter email."],
        unique: true,
        validate: [validator.isEmail, "Please Enter a valid Email"]
    },
    password: {
        type: String,
        required: [true, "Please enter password."],
        minLength: [8, "Password should be have more than 4 characters"],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default: "user"
    },
    resetpasswordToken: String,
    resetpasswordExpire: Date,
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        next();
    this.password = await bcrypt.hash(this.password, 10)
})

// JWT TOKEN 
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
}

// Compare Password 
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model("user", userSchema);
