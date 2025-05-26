const express = require("express");
const cors = require("cors");
const ApiError = require("./app/api-error")

const app = express();

require("dotenv").config();


const userRouter = require("./app/routes/user.route");
const conversationRouter = require("./app/routes/conversation.route")
const messageRouter = require("./app/routes/message.route")

app.use(cors());
app.use(express.json());

app.use("/user",userRouter);
app.use("/conversation",conversationRouter)
app.use("/message",messageRouter)

app.use((req, res, next) => {
    return next(new ApiError(404, "Resource not found"))
})

app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error"
    })
})

app.get("/" , (req, res) => {
    res.json("Hello")
});

module.exports = app;