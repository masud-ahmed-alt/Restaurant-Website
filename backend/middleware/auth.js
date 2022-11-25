const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('./catchAsuncErrors');
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

exports.isAuthenticatedUser = catchAsyncErrors(async (req, resp, next) => {
    const { token } = req.cookies;

    if (!token)
        return next(new ErrorHandler("Please login to access this resource!", 401))

    const decodedData = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decodedData.id)
    next()
})

