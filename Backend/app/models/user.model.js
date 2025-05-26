const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    hoten: {type: String, required: true},
    tendangnhap: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    email: {type: String },
    sdt: {type: String},
})

module.exports = mongoose.model("User", userSchema)