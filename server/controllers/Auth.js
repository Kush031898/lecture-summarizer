const User = require("../models/User");
const Adddetail = require('../models/AddDetail');
const OTP = require("../models/Otp");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
require("dotenv").config();
exports.sendOtp = async (req, res) => {
    try {
        // fetch the email to which we want to send the email 
        console.log("Printing the request from the front end ", req.body);
        const { email } = req.body;

        // check if the user already exits 
        const checkUser = await User.findOne({ email });

        // check for the user 
        if (checkUser) {
            return res.status(400).json({
                success: false,
                message: "User is already registered",
            })
        }
        // now generate the otp 
        // 1. Generate a 6-digit random number
        const otp = crypto.randomInt(100000, 999999).toString();

        // 2. Hash it (Security best practice)
        const hashedOtp = await bcrypt.hash(otp, 10);

        // create the otp payload which will contain all the info about the otp 
        const OtpPayload = { email, otp };
        // now create the entry of the otp in the data base 
        const Otpcreate = await OTP.create(OtpPayload);
        console.log("OTP created and email triggered via pre-save hook");
        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
        });
    }
    catch (error) {
        console.log("here printing the error in the send otp controller", error.message);
        return res.status(500).json({
            success: false,
            message: "There was an  error in sending the otp "
        })
    }
}


/* sign up :- we don't have to save the confirmpassword in the data base , because , we have  already saved the 
password , and itr is like saving two things repeadtely, the confirmPassword has done  its job when it is checked with  the password */
exports.signUp = async (req, res) => {
    try {
        // fetching the data from the front end 
        const { firstName, lastName, email, password, confirmPassword, otp } = req.body;
        // validate if anything is absent or not 
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            return res.status(403).json({
                success: false,
                message: "All the fields are required",
            })
        }
        // match the password and the confirm Password , and if they are nit matching return  the false reaponse 
        if (password !== confirmPassword) {
            return res.status(403).json({
                success: false,
                message: "Password and confirm password are different",
            });
        }
        // check if the user is already registered 
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(403).json({
                success: false,
                message: "User is already registered",
            })
        }
        // find most recent otp sended to the email 
        // here there are  two things to keep in the mind and that is such that , :-
        // The findOne returns a  single object  {} (or null if no match is found).
        // The find Returns: An Array of Objects [{...}, {...}] (even if only 1 item is found, it's still inside an array).
        const recentOtp = await OTP.findOne({ email }).sort({ createdAt: (-1) });
        console.log("Here printing the recent otp send to the email :- ", recentOtp);
        // validate the OTP
        if (recentOtp.length === 0) {
            return res.status(400).json({
                success: false,
                message: "OTP not Found",
            });

        }
        // so as the recentOtp contains the object we are matching here the Otp and the otp value inside the recentOtp object 
        else if (otp !== recentOtp.otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid Otp"
            })
        }
        /*As now the user is verified , the user has enetered the Otp and it is also correct , we just have to hash the password 
        for the security , and then save the entry in the database */
        const hashedpassword = await bcrypt.hash(password, 10);
        // as we have to add the additional details also in the database , but at first the additinal details will be null 
        const Profile = await Adddetail.create({}); // we do not want ro create the object of the additional details here 
        // also , as we have created that already in the model , just here making sure that the values that are  initialized there , and used here and an object is created 
        // now create the entry in the database 
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedpassword,
            additionalDetails: Profile._id,
        });

        return res.status(200).json({
            success: true,
            message: "User registered Successfully",
            user,
        })
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: "There was an error in registering the user.Please try again later"
        })
    }
}
// login 
// now comes the logic of the login 
exports.login = async (req, res) => {
    try {
        // fetch the dataa from the request's body  
        const { email, password } = req.body;
        // validate the data 
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "Please enter all the fields",
            })
        }
        // check if the user has registered or not 
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "The User is not registered . Please register first",
            })
        }
        console.log(user);
        // Match the password and create the jwt 
        if (await bcrypt.compare(password, user.password)) {
            // the payload that we want to store in the token 
            const payload = {
                email: user.email,
                id: user._id,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '2h',
            })
            // as we arec passing the cookie and in that we are passing the user , so no one should see the secure password that's why , this is done 
            user.password = undefined;
            // create the cookie 
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // through this we are settign the expiri time of the cokkie , when the cokkie time expores we can't them login 
                httpOnly: true,
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                user,
                token,
                message: "Logged In Successfully",
            })
        }
        else {
            return res.status(401).json({
                success: false,
                message: "The entered password is incorrect",
            })
        }

    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: "Can't Login , Please try again later",
        })
    }
}



// change Password 
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        // validate the data
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "Please enter all the fields",
            });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "New Password and Confirm New Password do not match",
            });
        }

        // fetch user id from req.user (populated by auth middleware)
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // check if old password matches
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Incorrect old password",
            });
        }

        // hash the new password and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        // send email notification (optional but recommended)
        try {
            await mailSender(
                user.email,
                "Password Changed Successfully",
                "Your password has been successfully updated for your Lecture Summarizer account."
            );
        } catch (error) {
            console.log("Error sending password change email:", error.message);
        }

        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: "There was an error while changing the password, please try again later",
        });
    }
};