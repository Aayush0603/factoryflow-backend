const axios = require("axios");

const sendEmail = async (to, subject, text) => {
  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: { name: "FactoryFlow", email: process.env.EMAIL_USER },
      to: [{ email: to }],
      subject,
      textContent: text
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json"
      }
    }
  );
};

module.exports = sendEmail;