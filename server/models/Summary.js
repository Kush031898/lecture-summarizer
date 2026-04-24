const mongoose = require("mongoose");

const SummarySchema = new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
    index:true,
  },
  videoUrl:{
    type:String,
    required:true,
  },
  // for the largere files we are going directly with the ai pipline , not saving it on the cloud , so as we have did required true
  // we cannot give the value as null 
  cloudId:{
    type:String,
    default:null,
  },
  status:{
    type:String,
    enum: ["Processing", "Completed", "Failed"],
    default: "Processing",
  },
  generatedSummary:{
    type:String,
    default:"",
  },
  //"I included the videoTitle to support Geospatial or Text-based indexing for future 
  // searchability and to provide contextual grounding for the Gemini LLM, ensuring higher 
  // summary accuracy."
  videoTitle: {
        type: String,
        trim: true,
        required: true,
    },
},{ timestamps: true });

module.exports = mongoose.model("Summary",SummarySchema);