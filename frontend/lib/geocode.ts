export async function reverseGeocode(lat: number, lng: number) {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );

    const data = await res.json();

    if (data.status === 'OK') {
      return data.results[0]?.formatted_address;
    }

    return 'Unknown location';
  } catch (error) {
    console.error('Reverse geocoding failed', error);
    return 'Unknown location';
  }
}
