'use client';

import { GoogleMap, MarkerF, useLoadScript } from '@react-google-maps/api';
import { useMemo } from 'react';

interface SmallMapCardProps {
  lat: number;
  lng: number;
}

export default function SmallMapCard({ lat, lng }: SmallMapCardProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const center = useMemo(() => ({ lat, lng }), [lat, lng]);

  if (!isLoaded) {
    return (
      <div className="h-[140px] w-full rounded-xl bg-gray-100 animate-pulse" />
    );
  }

  return (
    <div
      className="relative h-[140px] w-full overflow-hidden rounded-xl border cursor-pointer"
      onClick={() =>
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
      }
    >
      <GoogleMap
        mapContainerStyle={{
          width: '100%',
          height: '100%',
        }}
        center={center}
        zoom={15}
        options={{
          disableDefaultUI: true,
          zoomControl: false,
          clickableIcons: false,
          gestureHandling: 'none',
        }}
      >
        <MarkerF position={center} />
      </GoogleMap>

      {/* Overlay label */}
      <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded text-[11px] shadow">
        Tap to open map
      </div>
    </div>
  );
}
