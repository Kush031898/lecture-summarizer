const { UploadStream } = require("cloudinary");
const Files = require("../models/Summary.js");
const cloudinary = require("cloudinary").v2;
const {generateLectureSummary} = require("../utils/geminiAI.js");
// here is the async function for handling the upload to the Cloudinary 
async function uploadFileToCloudinary(file,folder)
{
    const options = {folder, 
        // this we have to do for the videos to get uploaded 
        resource_type: "video",
        chunk_size: 6000000,} // 6 million bytes = ~6MB};
       
    console.log("Temp file path ",file.tempFilePath);
    // the tempFilePath is the required paramter here , for uploading the image on the cloudinary
    
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_large(
            file.tempFilePath,
            options,
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    return reject(error);
                }
                // Once the LAST chunk is done, Cloudinary returns the real object
                resolve(result); 
            }
        );
    });
}
// here comes the API for uploading on the cloud 
exports.fileUploadToCloud = async(req,res) =>{
    res.setTimeout(300000); // Set response timeout to 5 minutes
    try{
        const{videoTitle} = req.body; // this is what we will provide in the postman , so this doesn't matters a lot , just as i have to put the video title in the database , that's why i am  fetching that 
        console.log(videoTitle);
        const uploadedFile = req.files.uploadLecture;
        console.log("here is the first uploaded file ",uploadedFile);

        // here comes the validation 
        if(!uploadedFile){
            return res.status(400).json({
                success:false,
                message:"You have not uploaded the  file , please uplaod the file",
            })
        }
        if(uploadedFile.size > 500 * 1024 * 1024)
        {
            return res.status(402).json({
                success:false,
                message:"The file uploaded is very large",
            })
        }

        // here comes the supported type of the file 
        const supportedType = ["mp4", "mov", "mp3", "wav", "m4a"];

        const fileType = uploadedFile.name.split(".").pop().toLowerCase();
        if(!supportedType.includes(fileType))
        {
            return res.status(403).json({
                success:false,
                message:`The fileType you have , is not supported , we are working to add that also ${fileType} , but kindly now , for add the fileType which is supported`,
            })
        }
        // as for the large what we are going to do we are going to by-pass the save to the cloud , just directly call the gemini api 
        // for that we will put this block into the try and catch error 
        console.log("Uploading to Cloudinary. Kindly wait...");
        let cloudinaryresponse;
        
        
             try{
                cloudinaryresponse = await uploadFileToCloudinary(uploadedFile,"Lecture Summarizer");

             }
             catch(clouderror)
             {
                if (uploadedFile.size > 100 * 1024 * 1024)
                {

                console.log(`File exceeds Cloudinary free limit. If you want to store the video into the cloud for 
                    future checking , please upload the mp3 file of this , till that we are  Proceeding with AI Summary only.`);
                cloudinaryresponse = 
                { 
                    secure_url: "CLOUDINARY_LIMIT_EXCEEDED", 
                    public_id: null 
                };
                } 
                else {
                    console.log("This is the error here :- ");
                    throw clouderror;
                }
             }
       

        const user = await Files.create({
            user:req.user.id,
            videoUrl:cloudinaryresponse.secure_url,
            cloudId:cloudinaryresponse.public_id,
            videoTitle:videoTitle,
        })

            res.status(200).json({
            success:true,
            message:"Uploaded Successfully. Processing Started",
            lectureId: user._id
        })
        
        console.log("Function:", generateLectureSummary);
        console.log("Calling Gemini...");
        generateLectureSummary( uploadedFile.tempFilePath, uploadedFile.mimetype, videoTitle ) 
        .then(async (summary) => { 
            console.log("AI Summary Generation Successful!");
            console.log("------------------------------------");
            console.log(summary); 
            console.log("------------------------------------");
            console.log("Thank you for using our app");
            await Files.findByIdAndUpdate(user._id, { generatedSummary: summary, status: "Completed", }); 
            // here as the cloudinary is hitting the
        }) 

        .catch(async (err) => { 
            await Files.findByIdAndUpdate(user._id, { status: "Failed", }); 
        }); 
    }

   catch(error) {
    console.log("This is the error message ",error.message);

    if (!res.headersSent) {
        return res.status(500).json({
            success:false,
            message:"Upload failed"
        });
    }
}
}

exports.getStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const fileRecord = await Files.findById(id);
        if (!fileRecord) {
            return res.status(404).json({ success: false, message: "Record not found" });
        }
        res.status(200).json({
            success: true,
            status: fileRecord.status,
            summary: fileRecord.generatedSummary
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}