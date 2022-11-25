const ErrorHandler = require("../utils/errorHandler")
const catchAsyncErrors = require('../middleware/catchAsuncErrors');
const User = require('../models/userModel');
const sendToken = require("../utils/jwtToken");

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

    sendToken(user,201,resp)
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

    sendToken(user,200,resp)
    
});

// Logout User 

exports.logoutUser = catchAsyncErrors(async(req, resp, next)=>{

    resp.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true
    });

    resp.status(200).json({
        success:true,
        message:"Logged Out Successfull!"
    })
})