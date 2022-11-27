const ErrorHandler = require("../utils/errorHandler")
const catchAsyncErrors = require('../middleware/catchAsuncErrors');
const User = require('../models/userModel');
const sendToken = require("../utils/jwtToken");
const sendEmail = require('../utils/sendEmail.js')
const crypto = require('crypto')

// Register a User
exports.registerUser = catchAsyncErrors(async (req, resp, next) => {
    const { name, email, password } = req.body;

    const user = await User.create({
        name, email, password,
        avatar: {
            public_id: "This is a sample id",
            url: "profilepicurl"
        }
    });

    sendToken(user, 201, resp)
});


// Login User 
exports.loginUser = catchAsyncErrors(async (req, resp, next) => {
    const { email, password } = req.body;
    // checking if user has given password and email both 
    if (!email || !password)
        return next(new ErrorHandler("Please enter Email and Password", 400))

    const user = await User.findOne({ email }).select("+password");

    if (!user)
        return next(new ErrorHandler("Invalid email or password!", 401))

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched)
        return next(new ErrorHandler("Invalid email or password!", 401))

    sendToken(user, 200, resp)

});

// Logout User 

exports.logoutUser = catchAsyncErrors(async (req, resp, next) => {

    resp.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    resp.status(200).json({
        success: true,
        message: "Logged Out Successfull!"
    });
});

// Forgot Password 
exports.forgotPassword = catchAsyncErrors(async (req, resp, next) => {
    const user = await User.findOne({ email: req.body.email })
    if (!user)
        return next(new ErrorHandler("User not found"), 404);

    // Get resetPassword Token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl}\n\nIf you have not requisted this email then please ignore it.`;

    try {
        await sendEmail({
            email: user.email,
            subject: `Restaurant Password Recovery`,
            message
        });

        resp.status(200).json({
            success: true,
            message: `Email send to ${user.email} successfully`
        })
    } catch (error) {
        user.resetpasswordToken = undefined;
        user.resetpasswordExpire = undefined;
        await user.save({ validateBeforeSave: false })
        return next(new ErrorHandler(error.message, 500))
    }
});


// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, resp, next) => {
    // Creating token hash
    const resetpasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetpasswordToken,
        resetpasswordExpire: { $gt: Date.now() }
    });

    if (!user)
        return next(new ErrorHandler("Reset Password token is invalid or has been expired."), 404);

    if (req.body.password !== req.body.confirmPassword)
        return next(new ErrorHandler("Password doesn't match."), 404);

    user.password = req.body.password;
    user.resetpasswordToken = undefined;
    user.resetpasswordExpire = undefined;


    await user.save();
    sendToken(user, 200, resp)
});