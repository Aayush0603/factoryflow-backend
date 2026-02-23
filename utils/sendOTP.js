const nodemailer = require("nodemailer");

const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_PASS,
    },
  });

  await transporter.sendMail({
    from: `"FactoryFlow" <${process.env.BREVO_USER}>`,
    to: email,
    subject: "Your OTP for Inquiry Tracking",
    html: `
      <h2>Your OTP Code</h2>
      <h1>${otp}</h1>
      <p>This OTP is valid for 5 minutes.</p>
    `,
  });
};

module.exports = sendOTP;