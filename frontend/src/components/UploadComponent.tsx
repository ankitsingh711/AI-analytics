'use client';

import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadComponentProps {
  onUploadSuccess: () => void;
}

export default function UploadComponent({ onUploadSuccess }: UploadComponentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      setUploadStatus('error');
      setMessage('Please upload a JSON file');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadStatus('success');
        setMessage('File uploaded successfully!');
        onUploadSuccess();
      } else {
        const errorData = await response.json();
        setUploadStatus('error');
        setMessage(errorData.detail || 'Upload failed');
      }
    } catch (error) {
      setUploadStatus('error');
      setMessage('Network error occurred');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Upload Drone Report</h2>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="mb-4">
          <p className="text-lg font-medium text-gray-900 mb-2">
            Drop your JSON file here, or click to browse
          </p>
          <p className="text-sm text-gray-500">
            Upload AI drone reports in JSON format
          </p>
        </div>
        
        <input
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={isUploading}
        />
        <label
          htmlFor="file-upload"
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isUploading ? 'Uploading...' : 'Choose File'}
        </label>
      </div>

      {uploadStatus !== 'idle' && (
        <div className={`mt-4 p-4 rounded-md ${
          uploadStatus === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <div className="flex items-center">
            {uploadStatus === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <span>{message}</span>
          </div>
        </div>
      )}
    </div>
  );
} 