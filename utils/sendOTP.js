const axios = require("axios");

const sendOTP = async (email, otp) => {
  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        name: "FactoryFlow",
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [
        {
          email: email,
        },
      ],
      subject: "Your OTP for Inquiry Tracking",
      htmlContent: `
        <h2>Your OTP Code</h2>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      `,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
    }
  );
};

module.exports = sendOTP;