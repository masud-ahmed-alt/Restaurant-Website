const express = require("express")
const app = express();
const errorMiddleware = require('./middleware/error')

app.use(express.json())
// Routes Imports

const products = require("./routes/productRoute");

app.use("/api/v1", products);

// Middleware for Errors
app.use(errorMiddleware)

module.exports = app;