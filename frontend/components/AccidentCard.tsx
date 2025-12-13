'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Check, X } from 'lucide-react';
import SmallMapCard from '@/components/smallMapCard';
import { reverseGeocode } from '@/lib/geocode';

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
}

interface AccidentCardProps {
  accident: Accident;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

export default function AccidentCard({ accident, onAccept, onReject }: AccidentCardProps) {
  const [address, setAddress] = useState<string>('Loading location...');

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
        <div className="flex gap-3 pt-2">
          <Button
            className="flex-1"
            variant="default"
            onClick={() => onAccept?.(accident._id)}
          >
            <Check className="w-4 h-4 mr-1" /> Accept
          </Button>
          <Button
            className="flex-1"
            variant="destructive"
            onClick={() => onReject?.(accident._id)}
          >
            <X className="w-4 h-4 mr-1" /> Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
