'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Check, 
  X, 
  Clock, 
  AlertTriangle,
  User,
  Calendar,
  AlertCircle,
  Navigation,
  ExternalLink
} from 'lucide-react';
import SmallMapCard from '@/components/smallMapCard';
import { reverseGeocode } from '@/lib/geocode';
import { updateAccidentStatus, getReportStatus } from '@/services/report';
import { formatDistanceToNow } from 'date-fns';

export interface Accident {
  _id: string;
  description: string;
  contactNumber: string;
  location: {
    latitude: number;
    longitude: number;
    source?: string;
  };
  images?: { url: string }[];
  createdAt?: string;
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
  casualties?: number;
  vehicleType?: string;
  weatherCondition?: string;
}

interface AccidentCardProps {
  accident: Accident;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onStatusChange?: (id: string, newStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED') => void;
  isCompact?: boolean;
}

export default function AccidentCard({ 
  accident, 
  onAccept, 
  onReject,
  onStatusChange,
  isCompact = false 
}: AccidentCardProps) {
  const [address, setAddress] = useState<string>('Loading location...');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'PENDING' | 'ACCEPTED' | 'REJECTED'>(
    accident.status || 'PENDING'
  );
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const addr = await reverseGeocode(accident.location.latitude, accident.location.longitude);
        setAddress(addr);
      } catch (error) {
        console.error('Failed to fetch address:', error);
        setAddress('Location not available');
      }
    };
    fetchAddress();
  }, [accident.location.latitude, accident.location.longitude]);

  useEffect(() => { 
    const fetchStatus = async () => {
      try {
        const response = await getReportStatus(accident._id);
        if (response.success && response.status) {
          setStatus(response.status);
        }
      } catch (error) {
        console.error('Failed to fetch status:', error);
      }
    };
    
    if (!accident.status) {
      fetchStatus();
    }
  }, [accident._id, accident.status]);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await updateAccidentStatus(accident._id, 'ACCEPTED');
      setStatus('ACCEPTED');
      onAccept?.(accident._id);
      onStatusChange?.(accident._id, 'ACCEPTED');
    } catch (err: any) {
      console.error('Failed to accept accident:', err.message);
      alert(err.message || 'Failed to accept accident');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await updateAccidentStatus(accident._id, 'REJECTED');
      setStatus('REJECTED');
      onReject?.(accident._id);
      onStatusChange?.(accident._id, 'REJECTED');
    } catch (err: any) {
      console.error('Failed to reject accident:', err.message);
      alert(err.message || 'Failed to reject accident');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'ACCEPTED': return 'bg-green-500';
      case 'REJECTED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${accident.location.latitude},${accident.location.longitude}`;
    window.open(url, '_blank');
  };

  const renderActionButtons = () => {
    if (status === 'ACCEPTED') {
      return (
        <div className="space-y-2">
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            disabled
          >
            <Check className="w-4 h-4 mr-2" /> Accepted
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => openGoogleMaps()}
          >
            <Navigation className="w-4 h-4 mr-2" /> Navigate
          </Button>
        </div>
      );
    }

    if (status === 'REJECTED') {
      return (
        <Button
          className="w-full bg-red-600 hover:bg-red-700"
          variant="destructive"
          disabled
        >
          <X className="w-4 h-4 mr-2" /> Rejected
        </Button>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex gap-3">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={handleAccept}
            disabled={isProcessing}
          >
            <Check className="w-4 h-4 mr-2" /> Accept
          </Button>
          <Button
            className="flex-1"
            variant="destructive"
            onClick={handleReject}
            disabled={isProcessing}
          >
            <X className="w-4 h-4 mr-2" /> Reject
          </Button>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => openGoogleMaps()}
        >
          <ExternalLink className="w-4 h-4 mr-2" /> View Location
        </Button>
      </div>
    );
  };

  if (isCompact) {
    return (
      <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-yellow-500">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${getStatusColor(status)} text-white`}>
                  {status}
                </Badge>
                {accident.severity && (
                  <Badge variant="outline" className={getSeverityColor(accident.severity)}>
                    {accident.severity}
                  </Badge>
                )}
              </div>
              <h4 className="font-semibold text-sm truncate">{accident.description}</h4>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {accident.contactNumber}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatTimeAgo(accident.createdAt)}
                </span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Show Less' : 'Details'}
            </Button>
          </div>
          
          {expanded && (
            <div className="mt-4 pt-4 border-t space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-xs flex-1">{address}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleAccept}
                  disabled={isProcessing || status !== 'PENDING'}
                >
                  <Check className="w-3 h-3 mr-1" /> Accept
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  onClick={handleReject}
                  disabled={isProcessing || status !== 'PENDING'}
                >
                  <X className="w-3 h-3 mr-1" /> Reject
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
      <CardContent className="p-6 space-y-5 ">
        {/* Header with Status and Severity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(status)} text-white px-3 py-1`}>
                {status}
              </Badge>
              {accident.severity && (
                <Badge variant="outline" className={`${getSeverityColor(accident.severity)} px-3 py-1`}>
                  {accident.severity} Severity
                </Badge>
              )}
            </div>
          </div>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatTimeAgo(accident.createdAt)}
          </span>
        </div>

        {/* Description with Expand/Collapse */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Incident Details
          </h3>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
            {accident.description}
          </p>
        </div>

        {/* Additional Information Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
            <User className="w-4 h-4 text-blue-600" />
            <div>
             
              <p className="font-medium">{accident.phoneNumber}</p>
            </div>
          </div>
          
          {accident.casualties !== undefined && (
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-xs text-gray-500">Casualties</p>
                <p className="font-medium">{accident.casualties} reported</p>
              </div>
            </div>
          )}

          {accident.vehicleType && (
            <div className="col-span-2 flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Vehicle Type</p>
                <p className="font-medium">{accident.vehicleType}</p>
              </div>
            </div>
          )}
        </div>

        {/* Images */}
        {accident.images && accident.images.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Images</h4>
            <div className="grid grid-cols-2 gap-2">
              {accident.images.slice(0, 2).map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={`Incident ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}

        {/* Location Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </h4>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => openGoogleMaps()}
            >
              <Navigation className="w-3 h-3 mr-1" />
              Open in Maps
            </Button>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">{address}</p>
            <SmallMapCard
              lat={accident.location.latitude}
              lng={accident.location.longitude}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t">
          {renderActionButtons()}
        </div>
      </CardContent>
    </Card>
  );
}