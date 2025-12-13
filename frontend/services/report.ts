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
    const response = await fetch(`${API_URL}/accidents/report`, { 
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

export const getReportStatus = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/accidents/status/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch report status');
    }
    return await response.json(); // { success, status: 'pending' | 'accepted' | 'rejected' }
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
export const updateAccidentStatus = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
  try {
    const response = await fetch(`${API_URL}/accidents/updateStatus/${id}`, {
      method: 'PUT', // or PUT, depending on your route
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update accident status');
    }
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'Something went wrong');
  }
};




// export const acceptAccident = async (id: string) => {
//   try {
//     const response = await fetch(`${API_URL}/accidents/accept/${id}`, {
//       method: 'POST', // or PUT depending on your backend    
//       headers: {
//         'Content-Type': 'application/json',    
//       },
//     });

//     if (!response.ok) {
//       const errorData = await response.json();    
//       throw new Error(errorData.message || 'Failed to accept accident');
//     }

//     return await response.json();
//   } catch (error: any) {
//     throw new Error(error.message || 'Something went wrong');    
//   }
// };



// // Reject an accident report
// export const rejectAccident = async (id: string) => {
//   try {
//     const response = await fetch(`${API_URL}/accidents/reject/${id}`, {
//       method: 'POST', // or PUT depending on your backend    
//       headers: {
//         'Content-Type': 'application/json',    
//       },
//     });

//     if (!response.ok) {
//       const errorData = await response.json();    
//       throw new Error(errorData.message || 'Failed to reject accident');
//     }

//     return await response.json();
//   } catch (error: any) {
//     throw new Error(error.message || 'Something went wrong');    
//   }
// };



