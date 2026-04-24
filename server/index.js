const express = require("express");
const app = express();

require("dotenv").config();
const PORT = process.env.PORT || 3000;

// the data base connection 
const connectdb = require("./config/database.js");

// the cloudinary connection 
const {cloudinaryConnect} = require("./config/cloudinary.js");
// the body parser
app.use(express.json());
const cors = require("cors");
app.use(cors({
    origin: "https://lecture-summarizer-ten.vercel.app",
    credentials: true,
}));
// the file parser 
const fileUpload = require("express-fileupload");
app.use(fileUpload({
useTempFiles: true,        // THIS is the magic flag! It saves to disk instead of RAM.
tempFileDir: '/tmp/',
abortOnLimit:true,
debug:true,
limits : { fileSize: 500 * 1024 * 1024 },
}));

connectdb();
cloudinaryConnect();
// the connect of the  routes and their connection with the mounting of the api 
const Upload = require("./routes/Upload.js");
const ProfileRoutes = require("./routes/Profile.js");
app.use("/api/v1/summarizer",Upload);
app.use("/api/v1/profile", ProfileRoutes);


app.listen(PORT,() =>{
    console.log(`The App is connected succesfully at the Port No :- ${PORT}`)
})