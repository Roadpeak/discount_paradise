// jshint esversion:8

const transporter = require("../config/smtp");
// async..await is not allowed in global scope, must use a wrapper
exports.sendMail = async (username, email, subject, message) => {
    let info = await transporter.sendMail({
        from: '"Info" info@anzaacademy.com', // sender address
        to: `${username},${email}`, // list of receivers
        subject: subject, // Subject line
        text: message, // plain text body
    });

    console.log("Message sent: %s", info.messageId);
};