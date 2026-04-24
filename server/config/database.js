const mongoose = require("mongoose");
require("dotenv").config();

const connectdb = () =>{
    mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("The Database is connected successfully")
    })
    .catch((error) =>{
        console.error(error);
        console.log("DB connection failed");
        process.exit(1);
    })
}
module.exports = connectdb;