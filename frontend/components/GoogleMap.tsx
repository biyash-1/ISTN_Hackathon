'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GoogleMap,
  useLoadScript,
  MarkerF,
  Autocomplete,
  InfoWindowF,
} from '@react-google-maps/api';
import { MapPin, Navigation, Maximize2 } from 'lucide-react';

type LatLngLiteral = {
  lat: number;
  lng: number;
};

const libraries: ('places')[] = ['places'];

const defaultCenter: LatLngLiteral = {
  lat: 27.700769,
  lng: 85.30014,
};

export default function HackathonMap() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  });

  const [center, setCenter] = useState<LatLngLiteral>(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState<LatLngLiteral | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [infoWindowOpen, setInfoWindowOpen] = useState<boolean>(false);
  const [detectingLocation, setDetectingLocation] = useState<boolean>(false);
  const [geoPermission, setGeoPermission] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const geocodeAndSetLocation = useCallback((position: GeolocationPosition) => {
    const pos: LatLngLiteral = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    setCenter(pos);
    setMarkerPosition(pos);
    setInfoWindowOpen(true);

    if (!geocoderRef.current && window.google) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }

    if (geocoderRef.current) {
      geocoderRef.current.geocode(
        { location: pos },
        (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
          if (status === 'OK' && results && results[0]) {
            setCurrentAddress(results[0].formatted_address);
          } else {
            setCurrentAddress('Address not found');
          }
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!('permissions' in navigator)) {
      setGeoPermission('unknown');
      return;
    }

    let mounted = true;
    (navigator as any)
      .permissions.query({ name: 'geolocation' })
      .then((status: PermissionStatus) => {
        if (!mounted) return;
        setGeoPermission(status.state as 'prompt' | 'granted' | 'denied');
        status.onchange = () => setGeoPermission(status.state as 'prompt' | 'granted' | 'denied');
      })
      .catch(() => {
        if (mounted) setGeoPermission('unknown');
      });

    return () => {
      mounted = false;
    };
  }, []);

  const onPlaceChanged = useCallback(() => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    if (place.geometry && place.geometry.location) {
      const newPosition: LatLngLiteral = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      setCenter(newPosition);
      setMarkerPosition(newPosition);
      setCurrentAddress(place.formatted_address || 'Searched Location');
      setInfoWindowOpen(true);
    }
  }, []);

  const onLoadMap = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmountMap = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handleUseMyLocation = useCallback(() => {
    if (!isLoaded) return;
    if (!navigator.geolocation) {
      alert('Geolocation not supported by your browser.');
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        geocodeAndSetLocation(pos);
        setDetectingLocation(false);
        setGeoPermission('granted');
      },
      (err) => {
        console.error('Geolocation error:', err);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoPermission('denied');
          alert('Location access denied. Please enable it in your browser/site settings.');
        } else {
          alert('Unable to get your location. Try again or use the search box.');
        }
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [isLoaded, geocodeAndSetLocation]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (loadError) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Error Loading Maps</h2>
          <p className="text-sm text-gray-600">Unable to load Google Maps. Please check your API key.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm font-medium">Loading Maps...</p>
        </div>
      </div>
    );
  }

  const containerStyle = {
    width: '100%',
    height: isFullscreen ? '100vh' : '300px',
  };

  return (
    <div 
      ref={containerRef}
      className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : 'w-full'}`}
    >
      {/* Compact Header - Only in fullscreen */}
      {isFullscreen && (
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-gray-900">Choose Location</h2>
              <p className="text-xs text-gray-600">Search or use current location</p>
            </div>
          </div>
        </div>
      )}

      {/* Controls Container */}
      <div className={`space-y-3 ${isFullscreen ? 'mb-4' : 'mb-3'}`}>
        {/* Search Box */}
        <Autocomplete
          onLoad={(autocomplete) => {
            autocompleteRef.current = autocomplete;
          }}
          onPlaceChanged={onPlaceChanged}
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search for an address..."
              className="w-full px-3 py-2.5 pl-10 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </Autocomplete>

        {/* My Location Button */}
        <button
          onClick={handleUseMyLocation}
          disabled={detectingLocation}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm ${
            detectingLocation
              ? 'bg-gray-100 text-gray-400 cursor-wait'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          <Navigation className={`w-4 h-4 ${detectingLocation ? 'animate-pulse' : ''}`} />
          {detectingLocation ? 'Detecting...' : 'Use My Location'}
        </button>

        {geoPermission === 'denied' && (
          <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
            <span>⚠️</span>
            <span>Location blocked. Enable in browser settings.</span>
          </div>
        )}

        {/* Selected Location Display - Compact */}
        {markerPosition && currentAddress && (
          <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-900">Selected Location</p>
                <p className="text-xs text-gray-700 break-words line-clamp-2">{currentAddress}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative rounded-lg overflow-hidden shadow-md border border-gray-200">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={14}
          onLoad={onLoadMap}
          onUnmount={onUnmountMap}
          options={{
            zoomControl: !isFullscreen,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {markerPosition && (
            <MarkerF
              position={markerPosition}
              onClick={() => setInfoWindowOpen(true)}
              animation={window.google.maps.Animation.DROP}
            >
              {infoWindowOpen && (
                <InfoWindowF
                  position={markerPosition}
                  onCloseClick={() => setInfoWindowOpen(false)}
                >
                  <div className="p-2">
                    <p className="font-semibold text-gray-900 text-xs mb-0.5">Current Location</p>
                    <p className="text-xs text-gray-600">{currentAddress}</p>
                  </div>
                </InfoWindowF>
              )}
            </MarkerF>
          )}
        </GoogleMap>

        {/* Fullscreen Toggle Button - Overlay on map */}
        {!isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute bottom-3 right-3 bg-white hover:bg-gray-50 p-2 rounded-lg shadow-lg border border-gray-200 transition-colors"
            title="Open fullscreen"
          >
            <Maximize2 className="w-4 h-4 text-gray-700" />
          </button>
        )}
      </div>

      {/* Exit Fullscreen Button - Below map in fullscreen mode */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="w-full mt-4 py-3 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors rounded-lg border border-gray-300 shadow-sm"
        >
          Exit Fullscreen
        </button>
      )}
    </div>
  );
}