const { sendWhatsAppMessage } = require("./whatsappService");
const { accidentAlertTemplate } = require("../utils/whatsappTemplates");

// 🔹 Nepal phone formatter (FIXES +1 issue)
const formatPhone = (phone) => {
  if (!phone) return null;

  // remove spaces, dashes, etc.
  const digits = phone.replace(/\D/g, "");

  // If already in Nepal international format
  if (digits.startsWith("977") && digits.length === 13) {
    return `+${digits}`;
  }

  // If local Nepal number (10 digits)
  if (digits.length === 10) {
    return `+977${digits}`;
  }

  console.error("Invalid phone number:", phone);
  return null;
};

const notifyServices = async ({
  services,
  serviceType,
  accidentLocation,
}) => {
  const topThree = services.slice(0, 3);

  for (const service of topThree) {
    const formattedPhone = formatPhone(service.phone);
    if (!formattedPhone) continue;

    const message = accidentAlertTemplate({
      serviceType,
      name: service.name,
      distanceKm: service.distanceKm,
      durationMin: service.durationMin,
      accidentLocation,
    });

    await sendWhatsAppMessage({
      to: formattedPhone, // ✅ always +977 now
      message,
    });
  }
};

module.exports = { notifyServices };