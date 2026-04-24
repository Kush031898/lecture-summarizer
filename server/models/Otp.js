const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OtpSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires:300, // for verification 
    },
});

//  A function to send the emails 
async function sendVerificationEmail(email,otp)
{
    try{
        const mailResponse = await mailSender(email, "Verification email from Lecture Summarizer",otp );
        console.log("Email Sent Successfully",mailResponse);

    }
    catch(error)
    {
        console.log("There was an error while sending the emails",error);
        throw error;
    }
}

// now the pre middleware , 
// as when some one comes for the sign up , the otp enter screen will be shown to him , till the time he had not 
// entered the otp and the otp has not been verified there will be no entry in the Database , we want to do something before the save of the database 
OtpSchema.pre("save",async function(next)
{
    if(this.isNew){
         await sendVerificationEmail(this.email,this.otp);
    }
//    here the (next ) was written that is not required when we are doing the async function(next) , that is required when we are doing only the next 
    
})
module.exports = mongoose.model("Otp",OtpSchema);