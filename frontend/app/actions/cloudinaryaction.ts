// app/lib/cloudinary/actions.ts
'use server';

import { v2 as cloudinary } from 'cloudinary';

// Configure the SDK with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Safe here on the server
});

export async function generateSignature() {
  // In a real app, add user authentication here
  // const user = await getCurrentUser();
  // if (!user) throw new Error('Not authenticated');

  const timestamp = Math.round(new Date().getTime() / 1000); // Current Unix time

  const paramsToSign = {
    timestamp: timestamp,
    // Optional: Specify a dynamic folder, e.g., based on report ID or user
    folder: 'accident_reports',
    // Optional: Add tags for easier management
    tags: 'user_upload, accident_report',
    source: 'uw', // Required parameter for the Upload Widget signature[citation:2]
  };

  // Generate the signature using Cloudinary's utility method
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  // Return all necessary data to the frontend EXCEPT the api_secret
  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
  };
}