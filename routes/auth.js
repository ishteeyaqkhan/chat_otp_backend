const express = require("express")
const router = express.Router();
const auth_schema = require("../Model/auth_schema");
const bcrypt = require("bcrypt");
require('dotenv').config();
const jwt = require("jsonwebtoken")
const accountSid = "AC871cb1f903b324355fc740b34b612ee7";
const authToken = "2d9efdf884ed892b51494b43003f8ccf";
const client = require('twilio')(accountSid, authToken);


router.post("/register", async (req, res) => {
    try {
        let isUser = await auth_schema.findOne({ email: req.body.email })
        let isPhone = await auth_schema.findOne({ phone: req.body.phone })
        if (isUser) {
            res.status(409).json({ status: false, message: "User already exist" })
            return
        }
        if (isPhone) {
            res.status(409).json({ status: false, message: "phone number already exist" })
            return
        }
        const hash = await bcrypt.hash(req.body.password, 10)
        let otpS = Math.floor(100000 + Math.random() * 900000).toString();

        let createUser = await auth_schema.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            gender: req.body.gender,
            phone: req.body.phone,
            password: hash,
            otp: otpS
        })
        let user = await createUser.save()
        await client.messages
            .create({
                body: `Your verification code is ${otpS}`,
                from: '+14704311412',
                to: `+91${req.body.phone}`
            })
        const { otp, password, ...rest } = user._doc;
        // console.log(sendMessage)
        res.status(201).json({
            status: true,
            message: "user enter otp to continue",
            data: rest
        })

    } catch (error) {
        console.log("error", error)
        res.status(400).json({
            status: true,
            message: error.message,
        })
    }
})

router.post("/login", async (req, res) => {
    try {
        let isEmail = await auth_schema.findOne({ email: req.body.email })
        if (!isEmail) {
            res.status(404).json({
                status: false,
                message: "User not found"
            })
            return
        }
        // res.send(isEmail)

        const isPasswordMatch = await bcrypt.compare(req.body.password, isEmail.password);
        if (!isPasswordMatch) {
            res.status(400).json({ status: false, message: "Wrong password" })
        } else {
            var token = jwt.sign({ id: isEmail._id }, 'secret');
            const { password, ...rest } = isEmail._doc
            res.status(200).json({ status: true, message: "login succesfully", data: { ...rest, token } })
        }
    } catch (error) {
        console.log("error", error)
    }
})
router.post("/verify-otp", async (req, res) => {
    try {
        let verifyOtp = await auth_schema.findById(req.body.id)
        if (verifyOtp) {
            if (verifyOtp.isVerifed) {
                let { otp, password, ...rest } = verifyOtp._doc;
                res.status(200).json({ message: "Already verified", data: rest })
            } else
                if (verifyOtp.otp != req.body.otp) {
                    res.status(400).json({ message: "Otp mismathed", satus: false })
                } else {
                    let user = await auth_schema.findByIdAndUpdate(req.body.id, {
                        otp: "",
                        isVerifed: true

                    })
                    let { otp, password, ...rest } = user._doc;
                    res.status(200).json({ message: "Verified succesfully", data: rest })
                }
        } else {
            res.status(400).json({ message: "User not found" })
        }
    } catch (error) {
        res.status(400).json({
            status: true,
            message: error.message,
        })
    }
})
// router.post("register", async (req, res) => {
//     try {

//     } catch (error) {
//         console.log("error", error)
//     }
// })
module.exports = router;