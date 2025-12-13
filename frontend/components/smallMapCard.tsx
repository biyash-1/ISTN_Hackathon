'use client';

import { GoogleMap, MarkerF, useLoadScript } from '@react-google-maps/api';

interface SmallMapCardProps {
  lat: number;
  lng: number;
}

const containerStyle = {
  width: '100%',
  height: '140px',
  borderRadius: '12px',
};

export default function SmallMapCard({ lat, lng }: SmallMapCardProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  if (!isLoaded) {
    return (
      <div className="h-[140px] rounded-xl bg-gray-100 animate-pulse" />
    );
  }

  const openInGoogleMaps = () => {
    window.open(
      `https://www.google.com/maps?q=${lat},${lng}`,
      '_blank'
    );
  };

  return (
    <div
      onClick={openInGoogleMaps}
      className="cursor-pointer overflow-hidden rounded-xl border border-gray-200 hover:shadow-md transition"
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat, lng }}
        zoom={15}
        options={{
          disableDefaultUI: true,
          gestureHandling: 'none',
          clickableIcons: false,
        }}
      >
        <MarkerF position={{ lat, lng }} />
      </GoogleMap>
    </div>
  );
}
