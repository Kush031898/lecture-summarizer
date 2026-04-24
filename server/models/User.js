const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        trim:true,
    },
    lastName:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
    },
    token:{
        type:String,
    },
    resetPasswordExpiryTime:{
        type:Date,
    },
    password:{
        type:String,
        required:true,
    },
    // we don't require this as this has done its job when we are checking for the password !== confirmPassword , after that it si no need to store it into the database 
    // confirmPassword:{
    //     type:String,
    //     required:true,
    // },
    additionalDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AddDetails",
        required: true
    },
},{ timestamps: true });

module.exports = mongoose.model("User",userSchema);