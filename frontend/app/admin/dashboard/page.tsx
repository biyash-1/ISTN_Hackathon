'use client';

import { useEffect, useState } from 'react';
import { getAccident } from '@/services/report'; // adjust path if needed
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Check, X } from 'lucide-react';
import SmallMapCard from '@/components/smallMapCard';
import { reverseGeocode } from '@/lib/geocode';

interface Accident {
  _id: string;
  description: string;
  contactNumber: string;
  location: {
    lat: number;
    lng: number;
    source?: string;
  };
  images: {
    url: string;
  }[];
  createdAt?: string;
}

export default function AdminDashboardPage() {
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccidents = async () => {
      try {
        const res = await getAccident();
        console.log("accidents",res)
        setAccidents(res.data || []);
        console.log("response",res)
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccidents();
  }, []);

  if (loading) {
    return <p className="p-6 text-center">Loading reports...</p>;
  }

  if (error) {
    return <p className="p-6 text-center text-red-500">{error}</p>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">🚨 Accident Reports</h1>

      {accidents.length === 0 ? (
        <p className="text-muted-foreground">No accident reports found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accidents.map((accident) => (
            <Card key={accident._id} className="rounded-2xl shadow-sm">
              <CardContent className="p-5 space-y-4">
                <p className="text-sm text-muted-foreground">
                  {accident.createdAt && new Date(accident.createdAt).toLocaleString()}
                </p>

                <p className="text-base font-medium">{accident.description}</p>

                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4" />
                  <span>{accident.phoneNumber}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {accident.location.latitude}, {accident.location.longitude}
                  </span>
                    <SmallMapCard
    lat={accident.location.latitude}
    lng={accident.location.longitude}
  />

                </div>

                {accident.images?.length > 0 && (
                  <img
                    src={accident.images[0].url}
                    alt="Accident"
                    className="w-full h-40 object-cover rounded-xl"
                  />
                )}

                <div className="flex gap-3 pt-2">
                  <Button className="flex-1" variant="default">
                    <Check className="w-4 h-4 mr-1" /> Accept
                  </Button>
                  <Button className="flex-1" variant="destructive">
                    <X className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
