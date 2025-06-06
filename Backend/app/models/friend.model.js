const mongoose = require("mongoose");

const friendSchema = new mongoose.Schema({
    user1: {type: mongoose.Schema.Types.ObjectId, ref: "User", require: true},// người gửi
    user2: {type: mongoose.Schema.Types.ObjectId, ref: "User", require: true}, // người nhận
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
    },
    createdAt: {type: Date, default: Date.now}

});

module.exports = mongoose.model("Friend", friendSchema)