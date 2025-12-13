'use client';

import { useState } from 'react';
import { MapPin, Navigation, Phone, User, Clock, AlertCircle } from 'lucide-react';

type CallRequest = {
  id: string;
  patientName: string;
  location: string;
  distance: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  lat: number;
  lng: number;
};

type ActiveJob = CallRequest | null;

export default function AmbulanceDriverPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [activeJob, setActiveJob] = useState<ActiveJob>(null);
  const [hasArrived, setHasArrived] = useState(false);
  const [requests, setRequests] = useState<CallRequest[]>([
    {
      id: '1',
      patientName: 'John Smith',
      location: '123 Main St, Downtown',
      distance: '2.3 km',
      time: '2 min ago',
      priority: 'high',
      lat: 27.7172,
      lng: 85.3240
    },
    {
      id: '2',
      patientName: 'Sarah Johnson',
      location: '456 Oak Ave, Thamel',
      distance: '4.1 km',
      time: '5 min ago',
      priority: 'medium',
      lat: 27.7150,
      lng: 85.3120
    },
    {
      id: '3',
      patientName: 'Mike Davis',
      location: '789 Park Rd, Patan',
      distance: '5.8 km',
      time: '8 min ago',
      priority: 'low',
      lat: 27.6700,
      lng: 85.3250
    }
  ]);

  const handleAccept = (req: CallRequest) => {
    setActiveJob(req);
    setRequests(requests.filter(r => r.id !== req.id));
    setHasArrived(false);
  };

  const handleReject = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
  };

  const handleNavigate = () => {
    if (activeJob) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${activeJob.lat},${activeJob.lng}`,
        '_blank'
      );
    }
  };

  const handleArrived = () => {
    setHasArrived(true);
    setTimeout(() => {
      setActiveJob(null);
      setHasArrived(false);
    }, 2000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header - Sticky */}
      <div className="bg-white shadow-lg sticky top-0 z-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Driver Info */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">Driver #A127</p>
                <p className="text-sm text-gray-600">Ambulance Unit 5</p>
              </div>
            </div>
            
            {/* Status Toggle */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-lg transition-all transform active:scale-95 shadow-md ${
                isOnline
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                  : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-gray-200'}`}></span>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </button>
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
                      <p className="text-2xl font-bold">{activeJob.patientName}</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getPriorityColor(activeJob.priority)}`}>
                      {activeJob.priority.toUpperCase()}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="text-lg font-semibold text-gray-800">{activeJob.location}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-blue-600">{activeJob.distance}</span>
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
                  <h2 className="text-2xl font-bold text-gray-900">Emergency Requests</h2>
                  <span className="bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-sm font-bold">
                    {requests.length} Pending
                  </span>
                </div>
                
                <div className="space-y-4">
                  {requests.map(req => (
                    <div key={req.id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-xl font-bold text-gray-900 mb-1">{req.patientName}</p>
                          <p className="text-gray-600">{req.location}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(req.priority)}`}>
                          {req.priority.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm mb-4">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-blue-600">{req.distance}</span>
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
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-xl font-bold text-gray-900 mb-2">No Pending Requests</p>
                <p className="text-gray-600">Standing by for emergency calls...</p>
              </div>
            )}

            {/* Offline */}
            {!isOnline && (
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-lg p-12 text-center">
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-xl font-bold text-gray-900 mb-2">You're Offline</p>
                <p className="text-gray-600">Toggle online to start receiving emergency requests</p>
              </div>
            )}
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Live Location
              </h2>
              <div className="relative w-full h-80 lg:h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-inner">
                <svg className="w-full h-full" viewBox="0 0 400 400">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                    </pattern>
                    <filter id="shadow">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  <rect width="400" height="400" fill="url(#grid)" />
                  
                  {/* Roads */}
                  <line x1="0" y1="200" x2="400" y2="200" stroke="#9ca3af" strokeWidth="4" />
                  <line x1="200" y1="0" x2="200" y2="400" stroke="#9ca3af" strokeWidth="4" />
                  
                  {/* Driver location */}
                  <circle cx="200" cy="200" r="16" fill="#3b82f6" stroke="white" strokeWidth="4" filter="url(#shadow)" />
                  <circle cx="200" cy="200" r="8" fill="white" opacity="0.5" />
                  <text x="200" y="240" textAnchor="middle" fill="#3b82f6" fontSize="14" fontWeight="bold">
                    Your Location
                  </text>
                  
                  {/* Patient location */}
                  {activeJob && (
                    <>
                      <circle cx="300" cy="120" r="16" fill="#ef4444" stroke="white" strokeWidth="4" filter="url(#shadow)" />
                      <circle cx="300" cy="120" r="8" fill="white" opacity="0.5" className="animate-pulse" />
                      <text x="300" y="105" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="bold">
                        Patient
                      </text>
                      <line x1="200" y1="200" x2="300" y2="120" stroke="#ef4444" strokeWidth="3" strokeDasharray="8,4" opacity="0.6" />
                    </>
                  )}
                </svg>
              </div>
              {activeJob && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 font-semibold">
                    Distance: {activeJob.distance}
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