import nodemailer from "nodemailer";
import { sanitizeInput } from "../middleware/sanitize.js";

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERV,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
    },
});

const sendVerificationEmail = async (email, token) => {
    const verificationLink = `http://localhost:5000/verify?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL,
        to: sanitizeInput(email),
        subject: "Email Verification - Auction Website",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification</h2>
        <p>Thank you for registering! Please click the button below to verify your email:</p>
        <a href="${verificationLink}" 
           style="background-color: #007bff; color: white; padding: 10px 20px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email
        </a>
        <p><small>This link will expire in 24 hours.</small></p>
      </div>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Verification email sent");
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

export default sendVerificationEmail;
