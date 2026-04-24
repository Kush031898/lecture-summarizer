const mongoose = require("mongoose");
// the trim:true -> removes the WhiteSpace ,  from both the beginning and end of a string before
//  it is saved to MongoDB. 
const DetailSchema = new mongoose.Schema({
    gender:{
        type:String,
        enum:["Male","Female","Prefer Not To Say",null],
        default:null,
    },
    about:{
        type:String,
        trim:true,
        default:null,
    },
    college:{
        type:String,
        default:null,
    },
    dateOfBirth: {
        type: String, // Storing as String for simpler frontend date-pickers, or use Date
        default: null
    },
    contactNumber: {
        type: String,
        trim: true,
        default: null
    },
    year: {
        type: String, // e.g., "3rd Year"
        default: null
    }

},{ timestamps: true });

module.exports = mongoose.model("AddDetails",DetailSchema);