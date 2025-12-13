'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Check, X } from 'lucide-react';
import SmallMapCard from '@/components/smallMapCard';
import { reverseGeocode } from '@/lib/geocode';
import { updateAccidentStatus, getReportStatus } from '@/services/report';

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
}

interface AccidentCardProps {
  accident: Accident;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

export default function AccidentCard({ accident, onAccept, onReject }: AccidentCardProps) {
  const [address, setAddress] = useState<string>('Loading location...');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'PENDING' | 'ACCEPTED' | 'REJECTED'>(
    accident.status || 'PENDING'
  );

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const addr = await reverseGeocode(accident.location.latitude, accident.location.longitude);
        setAddress(addr);
      } catch (error) {
        console.error('Failed to fetch address:', error);
        setAddress('Unable to load address');
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
    
    // Only fetch status if not already provided
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
    } catch (err: any) {
      console.error('Failed to reject accident:', err.message);
      alert(err.message || 'Failed to reject accident');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderActionButtons = () => {
    if (status === 'ACCEPTED') {
      return (
        <Button
          className="w-full bg-green-600 hover:bg-green-700"
          disabled
        >
          <Check className="w-4 h-4 mr-1" /> Accepted
        </Button>
      );
    }

    if (status === 'REJECTED') {
      return (
        <Button
          className="w-full bg-red-600 hover:bg-red-700"
          variant="destructive"
          disabled
        >
          <X className="w-4 h-4 mr-1" /> Rejected
        </Button>
      );
    }

    return (
      <div className="flex gap-3">
        <Button
          className="flex-1"
          variant="default"
          onClick={handleAccept}
          disabled={isProcessing}
        >
          <Check className="w-4 h-4 mr-1" /> Accept
        </Button>
        <Button
          className="flex-1"
          variant="destructive"
          onClick={handleReject}
          disabled={isProcessing}
        >
          <X className="w-4 h-4 mr-1" /> Reject
        </Button>
      </div>
    );
  };

  return (
    <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5 space-y-4">
        {/* Heading: Timestamp + Description */}
        <div className="space-y-1">
          {accident.createdAt && (
            <p className="text-sm text-muted-foreground">
              {new Date(accident.createdAt).toLocaleString()}
            </p>
          )}
          <p className="text-lg font-semibold">{accident.description}</p>
        </div>

        {/* Status Badge */}
        {status !== 'PENDING' && (
          <div className="flex justify-end">
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                status === 'ACCEPTED'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </span>
          </div>
        )}

        {/* Image */}
        {accident.images && accident.images.length > 0 && (
          <img
            src={accident.images[0].url}
            alt="Accident scene"
            className="w-full h-40 object-cover rounded-xl"
          />
        )}

        {/* Contact Number */}
        <div className="flex items-center gap-2 text-sm">
          <Phone className="w-4 h-4 text-gray-500" />
          <span>{accident.contactNumber}</span>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
            <p className="text-xs text-gray-600 line-clamp-2 flex-1">{address}</p>
          </div>
          {/* Map Preview */}
          <SmallMapCard
            lat={accident.location.latitude}
            lng={accident.location.longitude}
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2">
          {renderActionButtons()}
        </div>
      </CardContent>
    </Card>
  );
}