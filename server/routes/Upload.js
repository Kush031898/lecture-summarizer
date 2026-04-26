const express = require("express");
const router = express.Router();

const {signUp, sendOtp, login, changePassword} = require("../controllers/Auth.js");
const {ResetPasswordToken, ResetPassword} = require("../controllers/ResetPassword.js");
const {auth} = require("../middlewares/auth.js");
const {fileUploadToCloud, getStatus} = require("../controllers/LectureUpload.js");
// connection of the controllers with the routes 

router.post("/signup", signUp);
router.post("/login", login);
router.post("/sendOtp", sendOtp);
router.post("/changepassword", auth, changePassword);


// for the reset password 
router.post("/reset-password-token",ResetPasswordToken);
router.post("/reset-password",ResetPassword);

router.post("/summary",auth , fileUploadToCloud);
router.get("/status/:id", auth, getStatus);
// these are the middlewares 
router.get("/test", auth ,(req,res)=>{
res.json({
    success:true,
    message: "Your authentication is working perfectly!",
    user: req.user
})
});


module.exports = router;








// ---------------------------------FUTURE SCOPE -----------------------------------------------







// router.get("/admin",auth,isAdmin,(req,res) =>{
//    res.json({
//     success:true,
//     message:"Welcome to the Secure Admin Page "
// }) 
// });

// router.get("/farmer",auth,isFarmer,(req,res) =>{
//    res.json({
//     success:true,
//     message:"Welcome to the Secure  Farmer Page "
// }) 
// })
