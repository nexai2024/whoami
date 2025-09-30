import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import FileUpload from './FileUpload';
import { FileUploadService } from '../lib/services/fileUpload';
import { logger } from '../lib/utils/logger';

const { FiImage, FiFile, FiTrash2, FiDownload, FiCopy, FiGrid, FiList, FiSearch, FiFilter } = FiIcons;

const MediaManager = ({ onSelectFile, allowMultiple = false }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const userFiles = await FileUploadService.getUserFiles();
      setFiles(userFiles);
    } catch (err) {
      logger.error('Error loading files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (uploadedFiles) => {
    const newFiles = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles];
    setFiles(prev => [...newFiles, ...prev]);
  };

  const handleFileSelect = (file) => {
    if (allowMultiple) {
      setSelectedFiles(prev => 
        prev.includes(file.id) 
          ? prev.filter(id => id !== file.id)
          : [...prev, file.id]
      );
    } else {
      if (onSelectFile) {
        onSelectFile(file);
      }
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await FileUploadService.deleteFile(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
    } catch (err) {
      logger.error('Error deleting file:', err);
      alert('Failed to delete file. Please try again.');
    }
  };

  const copyFileUrl = (url) => {
    navigator.clipboard.writeText(url);
    alert('File URL copied to clipboard!');
  };

  const downloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.originalName;
    link.click();
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
      (filterType === 'images' && file.mimeType.startsWith('image/')) ||
      (filterType === 'documents' && !file.mimeType.startsWith('image/'));
    
    return matchesSearch && matchesFilter;
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const FileCard = ({ file }) => (
    <motion.div
      className={`bg-white rounded-lg border-2 transition-all cursor-pointer ${
        selectedFiles.includes(file.id) 
          ? 'border-indigo-500 shadow-md' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => handleFileSelect(file)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="aspect-square bg-gray-50 rounded-t-lg overflow-hidden">
        {file.mimeType.startsWith('image/') ? (
          <img 
            src={file.thumbnailUrl || file.url} 
            alt={file.originalName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <SafeIcon icon={FiFile} className="text-4xl text-gray-400" />
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-sm text-gray-900 truncate">
          {file.originalName}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {formatFileSize(file.size)}
        </p>
        
        <div className="flex items-center gap-1 mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyFileUrl(file.url);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Copy URL"
          >
            <SafeIcon icon={FiCopy} className="text-xs" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadFile(file);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Download"
          >
            <SafeIcon icon={FiDownload} className="text-xs" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteFile(file.id);
            }}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <SafeIcon icon={FiTrash2} className="text-xs" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const FileRow = ({ file }) => (
    <motion.div
      className={`flex items-center p-3 bg-white border rounded-lg transition-all cursor-pointer ${
        selectedFiles.includes(file.id) 
          ? 'border-indigo-500 shadow-md' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => handleFileSelect(file)}
      whileHover={{ scale: 1.01 }}
    >
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
        {file.mimeType.startsWith('image/') ? (
          <img 
            src={file.thumbnailUrl || file.url} 
            alt={file.originalName}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <SafeIcon icon={FiFile} className="text-gray-400" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">
          {file.originalName}
        </h3>
        <p className="text-sm text-gray-500">
          {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            copyFileUrl(file.url);
          }}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Copy URL"
        >
          <SafeIcon icon={FiCopy} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            downloadFile(file);
          }}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Download"
        >
          <SafeIcon icon={FiDownload} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteFile(file.id);
          }}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          title="Delete"
        >
          <SafeIcon icon={FiTrash2} />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <FileUpload
        onUploadComplete={handleUploadComplete}
        acceptedTypes={['image/*', 'application/pdf', 'text/*']}
        multiple={true}
        className="mb-6"
      />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Files</option>
            <option value="images">Images</option>
            <option value="documents">Documents</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-indigo-100 text-indigo-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <SafeIcon icon={FiGrid} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-indigo-100 text-indigo-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <SafeIcon icon={FiList} />
          </button>
        </div>
      </div>

      {/* Files Display */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <SafeIcon icon={FiImage} className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {searchTerm || filterType !== 'all' ? 'No files match your criteria' : 'No files uploaded yet'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredFiles.map(file => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map(file => (
            <FileRow key={file.id} file={file} />
          ))}
        </div>
      )}

      {/* Selection Actions */}
      {allowMultiple && selectedFiles.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border p-4 flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={() => {
              const selected = files.filter(f => selectedFiles.includes(f.id));
              if (onSelectFile) onSelectFile(selected);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Use Selected
          </button>
          <button
            onClick={() => setSelectedFiles([])}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaManager;