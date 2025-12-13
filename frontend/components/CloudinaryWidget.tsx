'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function CloudinaryUploadWidget({
  onUploadSuccess,
}: {
  onUploadSuccess: (result: any) => void;
}) {
  const widgetRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadWidget = () => {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
          sources: ['local', 'camera'],
          multiple: true,
          maxFiles: 5,
          folder: 'accident_reports',
        },
        (error: any, result: any) => {
          if (error) {
            console.error(error);
            return;
          }

          if (result?.event === 'success') {
            onUploadSuccess(result.info);
          }
        }
      );

      setIsReady(true);
    };

    if (window.cloudinary) {
      loadWidget();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    script.onload = loadWidget;
    document.body.appendChild(script);

    return () => {
      widgetRef.current?.destroy();
      widgetRef.current = null;
    };
  }, []);

  const openWidget = () => {
    widgetRef.current?.open();
  };

  return (
    <div className="text-center">
      <Button
        type="button"
        onClick={openWidget}
        variant="outline"
        disabled={!isReady}
      >
        <Upload className="mr-2 h-4 w-4" />
        Upload Photos/Video
      </Button>
    </div>
  );
}
