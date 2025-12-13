'use client';

import { useEffect, useState } from 'react';
import AccidentCard from "../../../components/AccidentCard";
import { getAccident } from '@/services/report';

interface Accident {
  _id: string;
  description: string;
  contactNumber: string;
  location: {
    latitude: number;
    longitude: number;
    source?: string;
  };
  images: { url: string }[];
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
        setAccidents(res.data || []); // or just res if it's already array
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAccidents();
  }, []);

  const handleAccept = (id: string) => console.log('Accept', id);
  const handleReject = (id: string) => console.log('Reject', id);

  if (loading) return <p className="p-6 text-center">Loading...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">🚨 Accident Reports</h1>
      {accidents.length === 0 ? (
        <p>No accident reports found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accidents.map(acc => (
            <AccidentCard
              key={acc._id}
              accident={acc}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
