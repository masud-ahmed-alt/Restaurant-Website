const Product = require('../models/productModel');
const ErrorHandler = require("../utils/errorHandler")
const catchAsyncErrors = require('../middleware/catchAsuncErrors');
const ApiFeatures = require('../utils/apifeatures');


// Create Product -- Admin
exports.createProduct = catchAsyncErrors(async (req, resp, next) => {

    req.body.user = req.user.id;
    const product = await Product.create(req.body);
    resp.status(201).json({
        success: true,
        product
    });
});

// get all products 
exports.getAllProducts = catchAsyncErrors(async (req, resp) => {

    const resultPerPage = 5;
    const productCount = await Product.countDocuments();
    const apiFeature = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage);

    const products = await apiFeature.query;
    resp.status(200).json({
        products,
        productCount,
        success: true
    });
})

// get product details 
exports.getProductDetails = catchAsyncErrors(async (req, resp, next) => {
    const product = await Product.findById(req.params.id)

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }
    resp.status(200).json({
        success: true,
        product
    })
})


// Update Product -- Admin 

exports.updateProduct = catchAsyncErrors(async (req, resp) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    resp.status(200).json({
        success: true,
        product
    })
})

// Delete Product Admin

exports.deleteProduct = catchAsyncErrors(async (req, resp) => {
    const product = await Product.findById(req.params.id)
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    await product.remove()
    resp.status(200).json({
        success: true,
        message: "Product deleted!"
    })
})