// The use has forgetted the password , and want to reset the password that's why the token is required and also the link is send through the email for the reset of the  password 
const User = require("../models/User");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const mailSender = require("../utils/mailSender");
// this is the API for the reset Password 
exports.ResetPasswordToken = async(req,res) =>{
    try {
        // fetch the  data from the request's body 
        const {email} = req.body;
        // valiadate the email and if false , return the response here  
        if(!email)
        {
            return res.status(400).json({
                success:false,
                message:"Please enter the valid email",
            })
        }
        const user = await User.findOne({email:email}); 
        /*here we are telling explicitly the key is this and also the variable is this ,but if we want to use the
        shorthand , liek the {email} , then for that the naming of the field in the models should be identical , so for different naming , we should use the used above */  
        
        // we don't have the email with  our selves 
        if(!user)
        {
            return res.status(403).json({
                success:false,
                message:"There is no such email registered , kindly check the  email",
            })
        };
        // generate the token 
        const token = crypto.randomUUID();
        // Update the token  and the expiration time in the user models 
        const updateuser = await User.findOneAndUpdate(
            {email:email},
            {
                token: token,
                resetPasswordExpiryTime: Date.now() + 5*60*1000, 
            },
            {new:true});
            console.log("Printing the updated User ",updateuser);
        // cerate the url 
        const url = `https://lecture-summarizer-ten.vercel.app/update-password/${token}`;
        // send the mail conatining all the info 
        await mailSender(email,"Password Reset Link",
            `This is your password reset link , that has been sent to you by the Lecture Solver : ${url}`);
        // return the response as all the things are done
            return res.status(200).json({
                success:true,
                message:"The reset password link has been sent to your registered Email ID , Kindly Check",
            })
    }
    catch(error)
    {
        console.log(error.message);
        return res.status(404).json({
            success:false,
            message:"There was some error generating the token or sending the email , kindly check kafter some time ",
        })
    }
}


// now the api for the actuall reste Password link 
exports.ResetPassword = async(req,res) =>{
    try {
        // fetch the data from the request's body 
        const{token,password,confirmPassword} = req.body; // the token is inside the 
        console.log(token,password,confirmPassword);
        // validate that data from the request's body 
        if( !password || !confirmPassword)
        {
            return res.status(403).json({
                success:false,
                message:"Please enter all the fields",
            })
        }
        if(password !== confirmPassword)
        {
            return res.status(402).json({
                success:false,
                message:"Password and Confirm Password should be same",
            })
        }
        // fetch  the data from the token and the validity of the token 
            const userDetails = await User.findOne({token:token}); // I hope now this is clear 
            console.log(userDetails);
            if(!userDetails)
            {
                return res.status(403).json({
                    success:false,
                    message:"The token in invalid ",
                })
            }
            // check the valididity of the token  
            if(userDetails.resetPasswordExpiryTime < Date.now())
            {
                return res.status(401).json({
                    success:false,
                    message:"The token is expired , kindly login again to generate  the token once agin ",
                });
            }
            // update the password for the security 
            const hashedPassword = await bcrypt.hash(password,10); // the 10 is the rounds , in how many round the password will be hashed , 10 is the industry standard 
        // now update the password and put into the data base 
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true},
        )
        // here we canm add the mail also , for the confirmation that the password is changed (future scope)
        // return the response
        return res.status(200).json({
            success:true,
            message:"The password is reset successfully",
        })
    }
    catch(error)
    {
        console.log(error.message);
        return res.status(400).json({
            success:false,
            message:"There was some error in changing the password , kindly try again later "
        })
    }
}