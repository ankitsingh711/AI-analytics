'use client';

import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText, X, RefreshCcw } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface UploadComponentProps {
  onUploadSuccess: () => void;
}

export default function UploadComponent({ onUploadSuccess }: UploadComponentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [isResetting, setIsResetting] = useState(false);

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

    setFileName(file.name);
    setIsUploading(true);
    setUploadStatus('idle');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        setUploadStatus('success');
        setMessage(`File uploaded successfully! Report for ${result.drone_id} on ${result.date} has been processed. Dashboard will update automatically.`);
        onUploadSuccess();
        
        // Reset after 4 seconds
        setTimeout(() => {
          setUploadStatus('idle');
          setMessage('');
          setFileName('');
          setUploadProgress(0);
        }, 4000);
      } else {
        const errorData = await response.json();
        setUploadStatus('error');
        setMessage(errorData.detail || 'Upload failed');
      }
    } catch (error) {
      setUploadStatus('error');
      setMessage('Network error occurred. Please check your connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetDatabase = async () => {
    setIsResetting(true);
    try {
      const response = await fetch('http://localhost:8000/reset-database', {
        method: 'POST',
      });

      if (response.ok) {
        setUploadStatus('success');
        setMessage('Database cleared successfully! You can now upload fresh data.');
        onUploadSuccess(); // Refresh the dashboard
        
        setTimeout(() => {
          setUploadStatus('idle');
          setMessage('');
        }, 3000);
      } else {
        setUploadStatus('error');
        setMessage('Failed to reset database. Please try again.');
      }
    } catch (error) {
      setUploadStatus('error');
      setMessage('Network error occurred while resetting database.');
    } finally {
      setIsResetting(false);
    }
  };

  const resetUpload = () => {
    setUploadStatus('idle');
    setMessage('');
    setFileName('');
    setUploadProgress(0);
  };

  return (
    <div className="space-y-4">
      <Card
        className={`relative overflow-hidden transition-all duration-300 ${
          isDragging
            ? 'border-primary bg-primary/5 scale-105'
            : 'border-dashed border-2 hover:border-primary/50'
        } ${
          uploadStatus === 'success' 
            ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
            : uploadStatus === 'error'
            ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
            : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            {/* Icon */}
            <div className="flex justify-center">
              {uploadStatus === 'success' ? (
                <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              ) : uploadStatus === 'error' ? (
                <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              ) : (
                <div className={`p-4 rounded-full transition-all duration-300 ${
                  isDragging 
                    ? 'bg-primary/20 scale-110' 
                    : 'bg-muted'
                }`}>
                  <Upload className={`h-8 w-8 transition-colors duration-300 ${
                    isDragging ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
              )}
            </div>

            {/* Main text */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {uploadStatus === 'success' ? 'Upload Successful!' :
                 uploadStatus === 'error' ? 'Upload Failed' :
                 isDragging ? 'Drop your file here' :
                 'Upload Drone Report'}
              </h3>
              
              <p className="text-sm text-muted-foreground">
                {uploadStatus === 'success' ? 'Your drone data has been processed and dashboard updated' :
                 uploadStatus === 'error' ? 'Please try again with a valid JSON file' :
                 'Drop your JSON file here, or click to browse'}
              </p>
            </div>

            {/* File input */}
            {uploadStatus !== 'success' && !isUploading && (
              <>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={isUploading}
                />
                <Button
                  asChild
                  variant={isDragging ? "default" : "outline"}
                  size="lg"
                  className="transition-all duration-300"
                >
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </label>
                </Button>
              </>
            )}

            {/* File info */}
            {fileName && (
              <div className="flex items-center justify-center space-x-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{fileName}</span>
                <Badge variant="secondary">JSON</Badge>
              </div>
            )}

            {/* Upload progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading and processing...</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Success actions */}
            {uploadStatus === 'success' && (
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetUpload}
                >
                  Upload Another
                </Button>
              </div>
            )}

            {/* Error actions */}
            {uploadStatus === 'error' && (
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetUpload}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </CardContent>

        {/* Animated background */}
        {isDragging && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 animate-pulse" />
        )}
      </Card>

      {/* Status message */}
      {message && uploadStatus !== 'idle' && (
        <Alert className={
          uploadStatus === 'success' 
            ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
            : 'border-red-500 bg-red-50 dark:bg-red-900/10'
        }>
          {uploadStatus === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          )}
          <AlertDescription className={
            uploadStatus === 'success' 
              ? 'text-green-800 dark:text-green-200' 
              : 'text-red-800 dark:text-red-200'
          }>
            {message}
          </AlertDescription>
        </Alert>
      )}

      {/* Database Management */}
      <Card className="border-dashed bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <RefreshCcw className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Database Management</p>
                <p className="text-xs text-muted-foreground">
                  Clear all data for testing multiple uploads
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDatabase}
              disabled={isResetting}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              {isResetting ? (
                <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCcw className="h-4 w-4 mr-2" />
              )}
              {isResetting ? 'Clearing...' : 'Clear Database'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Supported formats */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Supported format: JSON files only • Maximum size: 10MB • 
          <span className="text-primary"> Re-uploading same data will update existing records</span>
        </p>
      </div>
    </div>
  );
} 