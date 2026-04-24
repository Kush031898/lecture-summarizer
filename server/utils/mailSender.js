const nodemailer = require("nodemailer");

const mailSender = async(email,title,body) =>{
    try{
        // this is used for the connection 
        let transporter = nodemailer.createTransport({
            host:process.env.MAIL_HOST,
              port: 587,          // ✅ MUST be 587
    secure: false, 
            auth:{
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        })
        // this is the info , which we are sending from the mail 
        let info = await transporter.sendMail({
            from:`kushmantoo495@gmail.com`,
            to:`${email}`,
            subject:`${title}`,
            html:`<h2>OTP Verification</h2>
                    <p>Your OTP is:</p>
                    <h1>${body}</h1>
                    <p>This OTP expires in 5 minutes.</p>`
        });
        console.log("Here printing the info about :- ",info);
        return info;
    }
    catch(error)
    {
        console.log("here printing the error of the code ",error.message);
        throw error; 
    }
}
module.exports = mailSender;