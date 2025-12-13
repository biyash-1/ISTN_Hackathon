const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Location {
  lat: number;
  lng: number;
  source?: string;
}

interface ImageData {
  url: string;
  publicId: string;
  format: string;
}

interface ReportData {
  description: string;
  contactNumber: string;
  location: Location;
  images: ImageData[];
}

export const submitReport = async (data: ReportData) => {
  try {
    const response = await fetch(`${API_URL}/accidents/report`, { // Replace with your real endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit report');
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'Something went wrong');
  }
};

export const getAccident = async () => {
  try {
    const response = await fetch(`${API_URL}/accidents/getreport`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch accidents');
    }

    return await response.json(); // { success, count, data }
  } catch (error: any) {
    throw new Error(error.message || 'Something went wrong');
  }
};
