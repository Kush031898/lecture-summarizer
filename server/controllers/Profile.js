const User = require("../models/User");
const AddDetail = require("../models/AddDetail");

exports.getProfile = async (req, res) => {
    try {
        const id = req.user.id;
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        res.status(200).json({
            success: true,
            message: "User Data fetched successfully",
            data: userDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { 
            gender = "", 
            about = "", 
            contactNumber = "", 
            college = "", 
            year = "", 
            dateOfBirth = "" 
        } = req.body;
        const id = req.user.id;

        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await AddDetail.findById(profileId);
        
        if (gender !== undefined) profileDetails.gender = gender === "" ? null : gender;
        if (about !== undefined) profileDetails.about = about;
        if (contactNumber !== undefined) profileDetails.contactNumber = contactNumber;
        if (college !== undefined) profileDetails.college = college;
        if (year !== undefined) profileDetails.year = year;
        if (dateOfBirth !== undefined) profileDetails.dateOfBirth = dateOfBirth;
        
        await profileDetails.save();

        const updatedUserDetails = await User.findById(id).populate("additionalDetails").exec();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUserDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

const Summary = require("../models/Summary");

exports.getSummaryHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const history = await Summary.find({ user: userId })
            .sort({ createdAt: -1 })
            .select('videoTitle videoUrl status createdAt generatedSummary');
            
        res.status(200).json({
            success: true,
            data: history,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
