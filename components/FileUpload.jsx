import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { FileUploadService } from '../lib/services/fileUpload';
import { logger } from '../lib/utils/logger';

const { FiUpload, FiX, FiImage, FiFile, FiCheck, FiAlertCircle } = FiIcons;

const FileUpload = ({ 
  onUploadComplete, 
  acceptedTypes = ['image/*'], 
  maxSize = 5 * 1024 * 1024, // 5MB
  multiple = false,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    if (!files.length) return;

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      // Validate files
      const validFiles = files.filter(file => {
        if (file.size > maxSize) {
          setError(`File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB.`);
          return false;
        }
        
        const isValidType = acceptedTypes.some(type => {
          if (type === 'image/*') return file.type.startsWith('image/');
          return file.type === type;
        });
        
        if (!isValidType) {
          setError(`File ${file.name} is not a supported format.`);
          return false;
        }
        
        return true;
      });

      if (!validFiles.length) {
        setUploading(false);
        return;
      }

      const uploadResults = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setUploadProgress((i / validFiles.length) * 100);
        
        const result = await FileUploadService.uploadFile(file, {
          folder: 'user-uploads',
          generateThumbnail: file.type.startsWith('image/')
        });
        
        uploadResults.push(result);
      }

      setUploadProgress(100);
      
      if (onUploadComplete) {
        onUploadComplete(multiple ? uploadResults : uploadResults[0]);
      }

      logger.info('Files uploaded successfully:', uploadResults);
    } catch (err) {
      logger.error('Error uploading files:', err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return FiImage;
    return FiFile;
  };

  return (
    <div className={className}>
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragActive
            ? 'border-indigo-500 bg-indigo-50'
            : uploading
            ? 'border-green-500 bg-green-50'
            : error
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <SafeIcon name={undefined}  icon={FiUpload} className="text-2xl text-green-600" />
            </div>
            <div>
              <p className="text-green-700 font-medium">Uploading...</p>
              <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-green-600 mt-1">{Math.round(uploadProgress)}%</p>
            </div>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <SafeIcon name={undefined}  icon={FiAlertCircle} className="text-2xl text-red-600" />
            </div>
            <div>
              <p className="text-red-700 font-medium">Upload Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-700 underline"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-indigo-100 rounded-full flex items-center justify-center">
              <SafeIcon name={undefined}  icon={FiUpload} className="text-2xl text-indigo-600" />
            </div>
            <div>
              <p className="text-gray-700 font-medium">
                {dragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or{' '}
                <button
                  onClick={openFileDialog}
                  className="text-indigo-600 hover:text-indigo-700 underline"
                >
                  browse to upload
                </button>
              </p>
            </div>
            <div className="text-xs text-gray-400">
              <p>Supported: {acceptedTypes.join(', ')}</p>
              <p>Max size: {maxSize / 1024 / 1024}MB</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;