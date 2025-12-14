"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Navigation,
  Phone,
  User,
  Clock,
  AlertCircle,
  Bell,
} from "lucide-react";
import { getSocket } from "@/services/sockets";
import { Socket } from "socket.io-client";
import { useAuthStore } from "@/app/store/useAuthStore";
import HackathonMap from "@/components/GoogleMap";

type EmergencyData = {
  accidentId: string;
  id: string;
  patientName: string;
  location: string;
  distance: string;
  time: string;
  priority: "high" | "medium" | "low";
  lat: number;
  lng: number;
  description?: string;
  imageUrl?: string;
  reportedAt?: string;
  verified?: boolean;
};

type ActiveJob = EmergencyData | null;

// Simple Map Component to show driver location
function SimpleMap({ lat, lng, label }: { lat: number; lng: number; label?: string }) {
  return (
    <div className="relative w-full h-full bg-gray-100 rounded-xl overflow-hidden">
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        style={{ border: 0 }}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`}
        allowFullScreen
      />
      {label && (
        <div className="absolute top-3 left-3 bg-white px-3 py-2 rounded-lg shadow-md">
          <p className="text-sm font-semibold text-gray-800">{label}</p>
        </div>
      )}
    </div>
  );
}

export default function AmbulanceDriverPage() {
  const { user } = useAuthStore();
  const ambulanceId = user?.ambulanceId;

  const [isOnline, setIsOnline] = useState(true);
  const [activeJob, setActiveJob] = useState<ActiveJob>(null);
  const [hasArrived, setHasArrived] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [requests, setRequests] = useState<EmergencyData[]>([]);

  // Get driver's current location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setDriverLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(null);
      },
      (error) => {
        console.error("Error getting location:", error);
        setLocationError("Unable to retrieve your location");
        // Fallback to Kathmandu coordinates
        setDriverLocation({ lat: 27.7172, lng: 85.324 });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Socket.IO setup
  useEffect(() => {
    if (!ambulanceId || !isOnline) return;

    console.log("🚑 Connecting socket for ambulance:", ambulanceId);
    const socket = getSocket();

    // Register ambulance with backend
    socket.emit("ambulance:register", ambulanceId);

    // Listen for emergency notifications
    socket.on("emergency:new", (data: EmergencyData) => {
      console.log("🚨 EMERGENCY RECEIVED:", data);
      
      const formattedData = {
        ...data,
        time: data.time || "Just now",
        id: data.accidentId || data.id,
      };

      setRequests((prev) => [formattedData, ...prev]);

      if (Notification.permission === "granted") {
        new Notification("🚑 New Emergency Alert", {
          body: `Patient: ${data.patientName}\nLocation: ${data.location}\nDistance: ${data.distance}`,
          icon: "/ambulance-icon.png",
        });
      } else if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    });

    socket.on("emergency:remove", ({ accidentId }: { accidentId: string }) => {
      console.log("📭 Emergency removed:", accidentId);
      setRequests((prev) => prev.filter((r) => r.id !== accidentId && r.accidentId !== accidentId));
      
      if (activeJob?.id === accidentId || activeJob?.accidentId === accidentId) {
        setActiveJob(null);
        setHasArrived(false);
      }
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    return () => {
      console.log("🧹 Cleaning up socket listeners");
      socket.off("emergency:new");
      socket.off("emergency:remove");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, [ambulanceId, isOnline]);

  const handleToggleOnline = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    
    if (newStatus && ambulanceId) {
      const socket = getSocket();
      socket.emit("ambulance:register", ambulanceId);
    }
  };

  const handleAccept = (req: EmergencyData) => {
    setActiveJob(req);
    setRequests(requests.filter((r) => r.id !== req.id));
    setHasArrived(false);
    
    const socket = getSocket();
    socket.emit("emergency:accept", { 
      accidentId: req.accidentId || req.id,
      ambulanceId: ambulanceId 
    });
  };

  const handleReject = (id: string) => {
    setRequests(requests.filter((r) => r.id !== id));
    
    const socket = getSocket();
    socket.emit("emergency:reject", { 
      accidentId: id,
      ambulanceId: ambulanceId 
    });
  };

  const handleNavigate = () => {
    if (activeJob) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${activeJob.lat},${activeJob.lng}`,
        "_blank"
      );
    }
  };

  const handleArrived = () => {
    setHasArrived(true);
    
    if (activeJob && ambulanceId) {
      const socket = getSocket();
      socket.emit("emergency:arrived", { 
        accidentId: activeJob.accidentId || activeJob.id,
        ambulanceId: ambulanceId 
      });
    }
    
    setTimeout(() => {
      setActiveJob(null);
      setHasArrived(false);
    }, 2000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "low":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header - Sticky */}
      <div className="bg-white shadow-lg sticky top-0 z-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">Driver #{ambulanceId?.slice(-4) || "A127"}</p>
                <p className="text-sm text-gray-600">Ambulance Unit</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {requests.length > 0 && (
                <div className="relative">
                  <Bell className="w-6 h-6 text-blue-600" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {requests.length}
                  </span>
                </div>
              )}

              <button
                onClick={handleToggleOnline}
                className={`w-full sm:w-auto p-2 py-2 text-center rounded-xl font-bold  transition-all transform active:scale-95 shadow-md ${
                  isOnline
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                    : "bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <span
                    className={`  ${
                      isOnline ? "bg-white animate-pulse" : "bg-gray-200"
                    }`}
                  ></span>
                  {isOnline ? "Online" : "Offline"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Active Job & Requests */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Job */}
            {activeJob && (
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center gap-2 mb-5">
                  <Phone className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">Active Emergency</h2>
                </div>

                <div className="bg-white/95 backdrop-blur rounded-xl p-5 text-gray-900 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Patient Name</p>
                      <p className="text-2xl font-bold">
                        {activeJob.patientName}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getPriorityColor(
                        activeJob.priority
                      )}`}
                    >
                      {activeJob.priority.toUpperCase()}
                    </span>
                  </div>

                  {activeJob.description && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Description</p>
                      <p className="text-gray-800">{activeJob.description}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {activeJob.location}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-blue-600">
                        {activeJob.distance}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-600">{activeJob.time}</span>
                    </div>
                  </div>

                  {!hasArrived ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={handleNavigate}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all transform active:scale-95 shadow-md flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-5 h-5" />
                        Navigate
                      </button>
                      <button
                        onClick={handleArrived}
                        className="bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all transform active:scale-95 shadow-md"
                      >
                        ✓ Mark Arrived
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl text-center font-bold text-lg shadow-md animate-pulse">
                      ✓ Arrival Confirmed
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* New Requests */}
            {isOnline && requests.length > 0 && !activeJob && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Emergency Requests
                  </h2>
                  <span className="bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-sm font-bold">
                    {requests.length} Pending
                  </span>
                </div>

                <div className="space-y-4">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors bg-gradient-to-br from-white to-gray-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-xl font-bold text-gray-900 mb-1">
                            {req.patientName}
                          </p>
                          <p className="text-gray-600">{req.location}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(
                            req.priority
                          )}`}
                        >
                          {req.priority.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm mb-4">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-blue-600">
                            {req.distance}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-600">{req.time}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleAccept(req)}
                          className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all transform active:scale-95 shadow-md"
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="bg-gradient-to-r from-red-600 to-red-700 text-white py-3.5 rounded-xl font-bold hover:from-red-700 hover:to-red-800 transition-all transform active:scale-95 shadow-md"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No requests */}
            {isOnline && requests.length === 0 && !activeJob && (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-10 h-10 text-blue-400" />
                </div>
                <p className="text-xl font-bold text-gray-900 mb-2">
                  No Emergency Calls
                </p>
                <p className="text-gray-600">
                  You're online and ready to receive emergency notifications
                </p>
                <div className="mt-6 flex items-center justify-center gap-2 text-blue-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span className="text-sm">Listening for emergencies...</span>
                </div>
              </div>
            )}

            {/* Offline state */}
            {!isOnline && (
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-lg p-12 text-center">
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-xl font-bold text-gray-900 mb-2">
                  You're Offline
                </p>
                <p className="text-gray-600">
                  Go online to start receiving emergency calls
                </p>
                <button
                  onClick={handleToggleOnline}
                  className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all transform active:scale-95 shadow-md"
                >
                  Go Online
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Live Location Map */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Live Location
              </h2>
              
              <div className="relative w-full h-80 lg:h-96 rounded-xl overflow-hidden shadow-inner">
                {driverLocation ? (
                  <SimpleMap
                    lat={driverLocation.lat}
                    lng={driverLocation.lng}
                    label="Your Location"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 font-semibold">
                        {locationError || "Getting your location..."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {driverLocation && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 font-semibold">
                    📍 Lat: {driverLocation.lat.toFixed(5)}, Lng: {driverLocation.lng.toFixed(5)}
                  </p>
                </div>
              )}

              {activeJob && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800 font-semibold">
                    🎯 Distance to emergency: {activeJob.distance}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}