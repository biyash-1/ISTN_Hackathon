const client = require("./twilioClient");

const sendWhatsAppMessage = async ({ to, message }) => {
  try {
    const response = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${to}`,
      body: message,
    });
    console.log(response)

    return response.sid;
  } catch (error) {
    console.error("WhatsApp send failed:", error.message);
    throw error;
  }
};

module.exports = { sendWhatsAppMessage };