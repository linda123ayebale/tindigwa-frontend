import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

const ReceiptUploadModal = ({ isOpen, onClose, expenseId, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    // Reset states
    setErrorMessage('');
    setUploadStatus('idle');

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Please select a JPEG, PNG, GIF, or PDF file');
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setErrorMessage('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${api.baseURL}/expenses/${expenseId}/receipt`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload receipt');
      }

      const result = await response.json();
      setUploadStatus('success');
      
      // Call success callback after a short delay
      setTimeout(() => {
        onUploadSuccess && onUploadSuccess(result.filename);
        onClose();
        resetModal();
      }, 1500);

    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error.message || 'Failed to upload receipt');
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <Image size={24} className="text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText size={24} className="text-red-500" />;
    }
    return <FileText size={24} className="text-gray-500" />;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content receipt-upload-modal">
        <div className="modal-header">
          <h2>Upload Receipt</h2>
          <button 
            type="button" 
            className="modal-close-btn"
            onClick={handleClose}
            disabled={uploadStatus === 'uploading'}
          >
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {uploadStatus === 'success' ? (
            <div className="upload-success">
              <CheckCircle size={48} className="success-icon" />
              <h3>Receipt Uploaded Successfully!</h3>
              <p>Your receipt has been saved and linked to this expense.</p>
            </div>
          ) : (
            <>
              {/* File Drop Zone */}
              <div 
                className={`file-drop-zone ${selectedFile ? 'has-file' : ''} ${uploadStatus === 'uploading' ? 'uploading' : ''}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  disabled={uploadStatus === 'uploading'}
                />

                {selectedFile ? (
                  <div className="selected-file">
                    {getFileIcon(selectedFile.type)}
                    <div className="file-details">
                      <div className="file-name">{selectedFile.name}</div>
                      <div className="file-size">{formatFileSize(selectedFile.size)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="drop-zone-content">
                    <Upload size={48} className="upload-icon" />
                    <h3>Drop your receipt here</h3>
                    <p>or click to select a file</p>
                    <div className="file-requirements">
                      <small>Supports: JPEG, PNG, GIF, PDF (max 10MB)</small>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="upload-error">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Upload Progress */}
              {uploadStatus === 'uploading' && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                  <p>Uploading receipt...</p>
                </div>
              )}
            </>
          )}
        </div>

        {uploadStatus !== 'success' && (
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={uploadStatus === 'uploading'}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={!selectedFile || uploadStatus === 'uploading'}
            >
              {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Receipt'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptUploadModal;