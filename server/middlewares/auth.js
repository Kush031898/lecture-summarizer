const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

// now comes the  handles for handling the authorization , whether , you are verified even or not 
exports.auth = async(req,res,next) =>{
    try {
        // firstly fetch the token from the body , the token can be anywhere in the cookies , or in the body or in the header 
        const token = req.cookies?.token ||
                            req.body?.token||
                             req.header("Authorization")?.replace("Bearer ", "");
                            // this is the syntax for this 

        //  validate the token , before doing any thing else
            if(!token)
                {
                    return res.status(401).json({
                        success:false,
                        message:"Token Is Missing",
                    })
                }              
        //  now we have to do the verification of the token ,
        try{
            /*the .verify , deocde the token and then matches it with the JWT secret and if it is matched then the req.user will contain the decode
            and if not , we will throw an error */ 
            console.log("DEBUG: Token being verified ->", `|${token}|`); // The pipes || help see hidden spaces
            const decode = jwt.verify(token,process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        }
        catch(error)
        {
            console.log("JWT Verification Error Details:", error.message);
            return  res.status(403).json({
                success:false,
                memssage:"The token is invalid ",
            })
        }
        next();
    }
    catch(error)
    {
        console.log(error.message);
        return res.status(400).json({
            success:false,
            message:"There was some error while verifying the token , Please try again later",
        })
    }
}

// this is for the future expansion  only , not immediately 
// exports.isStudent = async(req,res,next) =>{
//     try {
//         if(req.user.accountType !== Student)
//         {
//             return res.status(403).json({
//                 success:false,
//                 message:"This is a protected route for the Students only",
//             })
//         }
//     }
//     catch(error)
//     {
//         console.log(error.message);
//         return res.status(403).json({
//             success:false,
//             message:"There was an error in verifying the user . Please try again",
//         })
//     }
// }

// // this is for the future expansion  only , not immediately 
// exports.isAdmin = async(req,res,next) =>{
//     try {
//         if(req.user.accountType !== Admin)
//         {
//             return res.status(403).json({
//                 success:false,
//                 message:"This is a protected route for the Admin only",
//             })
//         }
//     }
//     catch(error)
//     {
//         console.log(error.message);
//         return res.status(403).json({
//             success:false,
//             message:"There was an error in verifying the user . Please try again",
//         })
//     }
// }