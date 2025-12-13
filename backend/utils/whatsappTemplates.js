exports.accidentAlertTemplate = ({
  serviceType,
  name,
  distanceKm,
  durationMin,
  accidentLocation,
}) => {
  return `
🚨 *ACCIDENT ALERT*

Service Type: ${serviceType}
Name: ${name}
Distance: ${distanceKm} km
ETA: ${durationMin} min

📍 Location:
https://www.google.com/maps?q=${accidentLocation.latitude},${accidentLocation.longitude}

Please respond immediately.
`;
};