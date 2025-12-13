'use client';

import { useState,useEffect, useEffectEvent } from 'react';
import { Camera, Phone, MapPin, X, Check, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import CloudinaryUploadWidget from '@/components/CloudinaryWidget';
import  GoogleMap  from   "../components/GoogleMap";
import { submitReport } from '@/services/report';

const SimpleReportForm = () => {
  const [formData, setFormData] = useState({
    description: '',
    contactNumber: '',
    location: '',
  });

  useEffect(() =>{
    getCurrentLocation()
  },[])
  const [location, setLocation] = useState<{
  lat: number | null;
  lng: number | null;
  address: string;
}>({
  lat: null,
  lng: null,
  address: '',
});


  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Cloudinary upload success
  const handleCloudinaryUpload = (result: any) => {
    const newImage = {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      thumbnail: result.thumbnail_url,
    };
    
    setUploadedImages(prev => {
      if (prev.length >= 5) return prev;
      return [...prev, newImage];
    });
  };

  const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert('Geolocation not supported');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      setLocation(prev => ({
        ...prev,
        lat,
        lng,
        address: `Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`,
      }));
    },
    (error) => {
      alert('Location permission denied');
      console.error(error);
    },
    { enableHighAccuracy: true }
  );
};

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  if (location.lat === null || location.lng === null) {
  alert('Location is required');
  setIsSubmitting(false);
  return;
}

const submitData = {
  description: formData.description,
  phoneNumber: formData.contactNumber,
  location: {
    latitude: location.lat,
    longitude: location.lng,
    source: 'gps',
  },
  images: uploadedImages.map(img => ({
    url: img.url,
    public_id: img.publicId,
    format: img.format,
  })),
};


  try {
    const result = await submitReport(submitData);
    console.log('Report submitted successfully:', result);
    alert('Report submitted successfully!');
    setFormData({ description: '', contactNumber: '', location: '' });
    setUploadedImages([]);
  } catch (error: any) {
    console.error('Failed to submit report:', error.message);
    alert(`Error: ${error.message}`);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quick Accident Report
          </h1>
          <p className="text-gray-600">
            Submit essential information for immediate response
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left/Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Photo Card with Cloudinary */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg">
                    <Camera className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Upload Photos</CardTitle>
                    <CardDescription>Upload clear photos of the incident (max 5)</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {/* Cloudinary Upload Widget */}
                <div className="mb-6">
                  <div className="flex flex-col items-center justify-center w-full">
                    <div className={`
                      flex flex-col items-center justify-center w-full h-48 
                      border-2 border-dashed rounded-xl
                      transition-all duration-200
                      ${uploadedImages.length > 0 
                        ? 'border-blue-400 bg-blue-50' 
                        : 'border-gray-300 bg-gray-50'
                      }
                    `}>
                      <div className="flex flex-col items-center justify-center p-4">
                        <Upload className={`h-10 w-10 mb-3 ${uploadedImages.length > 0 ? 'text-blue-500' : 'text-gray-400'}`} />
                        <CloudinaryUploadWidget onUploadSuccess={handleCloudinaryUpload} />
                        {uploadedImages.length >= 5 && (
                          <p className="text-xs text-red-600 mt-2">Maximum 5 photos reached</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Display uploaded images */}
                  {uploadedImages.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">
                          Uploaded ({uploadedImages.length}/5)
                        </p>
                        {uploadedImages.length >= 5 && (
                          <span className="text-xs text-red-600">Maximum 5 photos</span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {uploadedImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                              <img
                                src={img.thumbnail || img.url}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white p-1 rounded-full 
                                       opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 flex items-center justify-center"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center truncate">
                              {img.format?.toUpperCase() || 'Image'} • Cloudinary
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Incident Description Card */}
            <Card className="border-purple-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-purple-600 font-bold">D</span>
                  </div>
                  <span>Incident Description</span>
                </CardTitle>
                <CardDescription>
                  Provide a clear description of what happened
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-700">
                      Detailed Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the incident in detail..."
                      className="min-h-[150px] resize-none"
                      required
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Be specific about what occurred</span>
                      <span>{formData.description.length}/2000</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Details Card */}
            <Card className="border-green-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <span>Contact Details</span>
                </CardTitle>
                <CardDescription>
                  Provide your contact information for follow-up
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber" className="text-gray-700">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Input
                        id="contactNumber"
                        name="contactNumber"
                        type="tel"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                        className="pl-10"
                        required
                      />
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Map & Submit */}
          <div className="lg:col-span-1 space-y-6">
            {/* Map Placeholder */}
            <Card className="shadow-sm">

  <CardContent className="pt-6">
    
    <div className="mt-4 text-center">
      <GoogleMap />  
     
    </div>
  </CardContent>
</Card>

            {/* Submit Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
              <CardHeader>
                <CardTitle>Ready to Submit</CardTitle>
                <CardDescription>
                  Review and submit your report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Check */}
                <div className="space-y-3">
                  <div className={`flex items-center space-x-3 ${uploadedImages.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${uploadedImages.length > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {uploadedImages.length > 0 ? <Check className="h-4 w-4" /> : <span className="text-xs">1</span>}
                    </div>
                    <span className="text-sm">Photos uploaded: {uploadedImages.length}/5</span>
                  </div>

                  <div className={`flex items-center space-x-3 ${formData.description ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${formData.description ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {formData.description ? <Check className="h-4 w-4" /> : <span className="text-xs">2</span>}
                    </div>
                    <span className="text-sm">Description provided</span>
                  </div>

                  <div className={`flex items-center space-x-3 ${formData.contactNumber ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${formData.contactNumber ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {formData.contactNumber ? <Check className="h-4 w-4" /> : <span className="text-xs">3</span>}
                    </div>
                    <span className="text-sm">Contact details filled</span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.description || !formData.contactNumber}
                  className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </Button>

                {/* Emergency Notice */}
                <div className="pt-4 border-t border-blue-200">
                  <p className="text-xs text-gray-600 text-center">
                    <span className="font-semibold text-red-600">Emergency?</span> Call 911 immediately
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleReportForm;