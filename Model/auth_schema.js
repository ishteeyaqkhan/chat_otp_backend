const mogoose = require("mongoose")
const bcrypt = require("bcrypt")
const authSchema = new mogoose.Schema({
    first_name: {
        type: String,
        require: true
    },
    last_name: {
        type: String,
        require: true
    },
    phone: {
        type: Number,
        require: true
    },
    gender: {
        type: String,
        require: true,
        enum: ["Male", "Female", "Other"]
    },
    email: {
        type: String,
        require: true,

    },
    isVerifed: {
        type: Boolean,
        default: false
    },
    otp: Number,
    password: {
        type: String,
        require: true
    }
})

module.exports = mogoose.model("user", authSchema)