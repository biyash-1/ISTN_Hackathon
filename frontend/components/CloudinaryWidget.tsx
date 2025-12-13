'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
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
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    console.log('🚀 CloudinaryUploadWidget mounted');
    
    // Check environment variables
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    
    console.log('📋 Environment check:', {
      cloudName: cloudName || '❌ Missing',
      uploadPreset: uploadPreset || '❌ Missing',
    });

    if (!cloudName || !uploadPreset) {
      setStatus('error');
      setErrorMessage(`Missing environment variables. Please add to .env.local:
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=${cloudName || 'your_cloud_name'}
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=${uploadPreset || 'your_preset_name'}`);
      console.error('❌ Missing environment variables');
      return;
    }

    const loadWidget = () => {
      if (!mountedRef.current) return;
      
      console.log('🔧 Attempting to create widget...');
      
      try {
        if (!window.cloudinary) {
          throw new Error('Cloudinary SDK not loaded');
        }

        // Destroy existing widget if any
        if (widgetRef.current) {
          console.log('🗑️ Destroying existing widget');
          widgetRef.current.destroy();
          widgetRef.current = null;
        }

        widgetRef.current = window.cloudinary.createUploadWidget(
          {
            cloudName: cloudName,
            uploadPreset: uploadPreset,
            sources: ['local', 'camera'],
            multiple: true,
            maxFiles: 5,
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov'],
            maxFileSize: 10000000, // 10MB
            folder: 'accident_reports',
            cropping: false,
            showSkipCropButton: true,
            // These settings help prevent the null error
            styles: {
              palette: {
                window: "#FFFFFF",
                windowBorder: "#90A0B3",
                tabIcon: "#0078FF",
                menuIcons: "#5A616A",
                textDark: "#000000",
                textLight: "#FFFFFF",
                link: "#0078FF",
                action: "#FF620C",
                inactiveTabIcon: "#0E2F5A",
                error: "#F44235",
                inProgress: "#0078FF",
                complete: "#20B832",
                sourceBg: "#E4EBF1"
              }
            }
          },
          (error: any, result: any) => {
            if (error) {
              console.error('❌ Upload error:', error);
              setErrorMessage(`Upload error: ${error.message || 'Unknown error'}`);
              return;
            }

            console.log('📦 Widget event:', result?.event);

            if (result?.event === 'success') {
              console.log('✅ Upload successful:', result.info);
              if (mountedRef.current) {
                onUploadSuccess(result.info);
              }
            }
            
            // Log all events for debugging
            if (result?.event) {
              console.log(`Event: ${result.event}`);
            }
          }
        );

        console.log('✅ Widget created successfully');
        if (mountedRef.current) {
          setStatus('ready');
        }
      } catch (err: any) {
        console.error('❌ Widget creation failed:', err);
        if (mountedRef.current) {
          setStatus('error');
          setErrorMessage(`Widget creation failed: ${err.message}`);
        }
      }
    };

    // Check if Cloudinary is already loaded
    if (window.cloudinary) {
      console.log('✅ Cloudinary already loaded');
      // Small delay to ensure DOM is ready
      setTimeout(loadWidget, 100);
      return;
    }

    // Load Cloudinary script
    console.log('📥 Loading Cloudinary script...');
    const existingScript = document.querySelector('script[src*="upload-widget.cloudinary.com"]');
    
    if (existingScript) {
      console.log('⚠️ Script tag exists, waiting for load...');
      const checkInterval = setInterval(() => {
        if (window.cloudinary) {
          clearInterval(checkInterval);
          loadWidget();
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.cloudinary && mountedRef.current) {
          setStatus('error');
          setErrorMessage('Cloudinary script failed to load after 5 seconds');
        }
      }, 5000);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    
    script.onload = () => {
      console.log('✅ Cloudinary script loaded');
      // Add delay to ensure everything is ready
      setTimeout(loadWidget, 200);
    };
    
    script.onerror = (err) => {
      console.error('❌ Script load failed:', err);
      if (mountedRef.current) {
        setStatus('error');
        setErrorMessage('Failed to load Cloudinary script. Check your internet connection.');
      }
    };
    
    document.body.appendChild(script);

    return () => {
      console.log('🧹 Cleaning up widget');
      mountedRef.current = false;
      if (widgetRef.current) {
        try {
          widgetRef.current.destroy();
        } catch (e) {
          console.log('Error destroying widget:', e);
        }
        widgetRef.current = null;
      }
    };
  }, []); // Empty deps - only run once

  const openWidget = () => {
    console.log('🖱️ Button clicked');
    console.log('Widget ref:', widgetRef.current ? '✅ Exists' : '❌ Null');
    console.log('Status:', status);
    
    if (!widgetRef.current) {
      console.error('❌ Widget not initialized');
      setErrorMessage('Widget not initialized. Please refresh the page.');
      return;
    }

    try {
      console.log('🚪 Opening widget...');
      widgetRef.current.open();
      console.log('✅ Widget.open() called successfully');
    } catch (err: any) {
      console.error('❌ Failed to open widget:', err);
      setErrorMessage(`Failed to open widget: ${err.message}`);
      setStatus('error');
    }
  };

  return (
    <div className="text-center space-y-2">
      <Button
        type="button"
        onClick={openWidget}
        variant="outline"
        disabled={status !== 'ready'}
        className="w-auto"
      >
        <Upload className="mr-2 h-4 w-4" />
        {status === 'loading' && 'Loading...'}
        {status === 'ready' && 'Upload Photos/Video'}
        {status === 'error' && 'Upload Error'}
      </Button>
      
      {status === 'loading' && (
        <p className="text-xs text-gray-500">
          Initializing upload widget...
        </p>
      )}
      
      {status === 'ready' && (
        <p className="text-xs text-gray-500">
          Click to upload up to 5 files
        </p>
      )}
      
      {status === 'error' && (
        <div className="flex items-start justify-center gap-2 text-xs text-red-600 max-w-sm mx-auto">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p className="text-left whitespace-pre-line">{errorMessage}</p>
        </div>
      )}
      
      <details className="text-xs text-gray-400 mt-2">
        <summary className="cursor-pointer hover:text-gray-600">Debug Info</summary>
        <div className="mt-2 text-left bg-gray-50 p-2 rounded space-y-1">
          <div>Status: {status}</div>
          <div>Widget: {widgetRef.current ? '✅ Initialized' : '❌ Not initialized'}</div>
          <div>Cloudinary SDK: {typeof window !== 'undefined' && window.cloudinary ? '✅ Loaded' : '❌ Not loaded'}</div>
          <div>Cloud Name: {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '❌ Missing'}</div>
          <div>Upload Preset: {process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '❌ Missing'}</div>
        </div>
      </details>
    </div>
  );
}