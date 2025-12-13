'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  CheckCircle, XCircle, MapPin, Phone, Mail, Calendar, Clock,
  Download, Eye, User, AlertCircle, RefreshCw, Search, Filter,
  X, FileText, ImageIcon, Video
} from 'lucide-react';

// Types
interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

interface Reporter {
  name: string;
  phone: string;
  email?: string;
}

interface Photo {
  id: string;
  url: string;
  caption?: string;
  uploaded_at: string;
}

interface VideoMedia {
  id: string;
  url: string;
  duration: number;
  uploaded_at: string;
}

interface Media {
  photos: Photo[];
  videos: VideoMedia[];
}

interface AccidentReport {
  id: string;
  report_number: string;
  date: string;
  time: string;
  location: Location;
  description: string;
  reporter: Reporter;
  media: Media;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
}

// Toast Notification Component
interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => (
  <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
    type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
  }`}>
    {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
    <span>{message}</span>
    <button onClick={onClose} className="ml-2 hover:opacity-80">
      <X size={18} />
    </button>
  </div>
);

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Lightbox Component
interface LightboxProps {
  images: Photo[];
  currentIndex: number;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, currentIndex, onClose }) => {
  const [index, setIndex] = useState(currentIndex);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300">
        <X size={32} />
      </button>
      <div className="relative max-w-4xl w-full px-4" onClick={e => e.stopPropagation()}>
        <img src={images[index].url} alt="" className="w-full h-auto rounded-lg" />
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full ${i === index ? 'bg-white' : 'bg-gray-500'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Report Card Component
interface ReportCardProps {
  report: AccidentReport;
  onAccept: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  loading: string | null;
}

const ReportCard: React.FC<ReportCardProps> = React.memo(({ report, onAccept, onReject, loading }) => {
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleRejectSubmit = () => {
    if (rejectionReason.trim()) {
      onReject(report.id, rejectionReason);
      setRejectModalOpen(false);
      setRejectionReason('');
    }
  };

  const handleAcceptConfirm = () => {
    onAccept(report.id);
    setAcceptModalOpen(false);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-2 mb-4 pb-3 border-b">
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            {report.report_number}
          </span>
          <span className="text-xs text-gray-500">{formatDate(report.created_at)}</span>
        </div>

        {/* Location & Time */}
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <a
              href={`https://maps.google.com/?q=${report.location.latitude},${report.location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              {report.location.address}
            </a>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar size={16} className="text-gray-400" />
              <span>{report.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} className="text-gray-400" />
              <span>{report.time}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-sm text-gray-700">
            {showFullDesc ? report.description : `${report.description.slice(0, 100)}${report.description.length > 100 ? '...' : ''}`}
          </p>
          {report.description.length > 100 && (
            <button
              onClick={() => setShowFullDesc(!showFullDesc)}
              className="text-sm text-blue-600 hover:underline mt-1"
            >
              {showFullDesc ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Reporter Info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <User size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Reporter Information</span>
          </div>
          <div className="space-y-1 ml-6">
            <p className="text-sm text-gray-600">{report.reporter.name}</p>
            <a href={`tel:${report.reporter.phone}`} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
              <Phone size={14} />
              {report.reporter.phone}
            </a>
            {report.reporter.email && (
              <a href={`mailto:${report.reporter.email}`} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                <Mail size={14} />
                {report.reporter.email}
              </a>
            )}
          </div>
        </div>

        {/* Media Gallery */}
        {(report.media.photos.length > 0 || report.media.videos.length > 0) && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Media</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {report.media.photos.slice(0, 5).map((photo, idx) => (
                <div
                  key={photo.id}
                  onClick={() => openLightbox(idx)}
                  className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                >
                  <img src={photo.url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  {idx === 4 && report.media.photos.length > 5 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-medium">
                      +{report.media.photos.length - 5}
                    </div>
                  )}
                </div>
              ))}
              {report.media.videos.map(video => (
                <div key={video.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                  <Video size={32} className="text-gray-400" />
                  <span className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                    {video.duration}s
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setAcceptModalOpen(true)}
            disabled={loading === report.id}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-10"
          >
            {loading === report.id ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <>
                <CheckCircle size={18} />
                Accept
              </>
            )}
          </button>
          <button
            onClick={() => setRejectModalOpen(true)}
            disabled={loading === report.id}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-10"
          >
            <XCircle size={18} />
            Reject
          </button>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={acceptModalOpen} onClose={() => setAcceptModalOpen(false)} title="Accept Report">
        <p className="text-gray-600 mb-6">Are you sure you want to accept report {report.report_number}?</p>
        <div className="flex gap-3">
          <button
            onClick={() => setAcceptModalOpen(false)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAcceptConfirm}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Confirm
          </button>
        </div>
      </Modal>

      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Report">
        <p className="text-gray-600 mb-4">Please provide a reason for rejecting report {report.report_number}:</p>
        <select
          value={rejectionReason}
          onChange={e => setRejectionReason(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a reason...</option>
          <option value="Incomplete information">Incomplete information</option>
          <option value="Invalid photos/videos">Invalid photos/videos</option>
          <option value="Duplicate report">Duplicate report</option>
          <option value="Outside jurisdiction">Outside jurisdiction</option>
          <option value="Other">Other</option>
        </select>
        <div className="flex gap-3">
          <button
            onClick={() => setRejectModalOpen(false)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleRejectSubmit}
            disabled={!rejectionReason}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reject
          </button>
        </div>
      </Modal>

      {lightboxOpen && (
        <Lightbox
          images={report.media.photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
});

ReportCard.displayName = 'ReportCard';

// Main Dashboard Component
export default function AdminDashboard() {
  const [reports, setReports] = useState<AccidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/accident-reports');
        
        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }
        
        const data = await response.json();
        setReports(data.reports || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load reports. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleAccept = useCallback(async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/accident-reports/${id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to accept report');
      }

      setReports(prev => prev.filter(r => r.id !== id));
      setToast({ message: 'Report accepted successfully', type: 'success' });
    } catch (err) {
      console.error('Error accepting report:', err);
      setToast({ message: 'Failed to accept report', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleReject = useCallback(async (id: string, reason: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/accident-reports/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject report');
      }

      setReports(prev => prev.filter(r => r.id !== id));
      setToast({ message: `Report rejected: ${reason}`, type: 'success' });
    } catch (err) {
      console.error('Error rejecting report:', err);
      setToast({ message: 'Failed to reject report', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/accident-reports');
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      
      const data = await response.json();
      setReports(data.reports || []);
      setToast({ message: 'Reports refreshed', type: 'success' });
    } catch (err) {
      console.error('Error refreshing reports:', err);
      setToast({ message: 'Failed to refresh reports', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.report_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.reporter.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Recent Accident Reports</h1>
              <p className="text-gray-600 mt-1">Review and manage submitted reports</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 md:flex-initial">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                />
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-2">
                  <div className="flex-1 h-10 bg-gray-200 rounded"></div>
                  <div className="flex-1 h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No reports found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map(report => (
              <ReportCard
                key={report.id}
                report={report}
                onAccept={handleAccept}
                onReject={handleReject}
                loading={actionLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}