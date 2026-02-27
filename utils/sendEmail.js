const axios = require("axios");

const sendEmail = async (to, subject, text) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.BREVO_SENDER_EMAIL,
          name: "FactoryFlow"
        },
        to: [
          {
            email: to
          }
        ],
        subject: subject,
        textContent: text
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {
    console.error("Brevo email error:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = sendEmail;