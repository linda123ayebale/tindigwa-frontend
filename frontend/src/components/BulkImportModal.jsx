import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Download, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const BulkImportModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [importStatus, setImportStatus] = useState('idle'); // idle, importing, success, error
  const [importResults, setImportResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    // Reset states
    setErrorMessage('');
    setImportStatus('idle');
    setImportResults(null);

    // Validate file type
    if (file.type !== 'text/csv' && !file.name.toLowerCase().endsWith('.csv')) {
      setErrorMessage('Please select a CSV file');
      return;
    }

    // Validate file size (50MB max for bulk imports)
    const maxFileSize = 50 * 1024 * 1024;
    if (file.size > maxFileSize) {
      setErrorMessage('File size must be less than 50MB');
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

  const handleImport = async () => {
    if (!selectedFile) return;

    setImportStatus('importing');
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${api.baseURL}/expenses/import`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import expenses');
      }

      const result = await response.json();
      setImportResults(result);
      setImportStatus('success');

      // Call success callback
      onImportSuccess && onImportSuccess(result);

    } catch (error) {
      setImportStatus('error');
      setErrorMessage(error.message || 'Failed to import expenses');
    }
  };

  const downloadTemplate = async () => {
    try {
  const response = await fetch(`${api.baseURL}/expenses/template`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'expense_template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download template:', error);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setImportStatus('idle');
    setImportResults(null);
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content bulk-import-modal">
        <div className="modal-header">
          <h2>Import Expenses from CSV</h2>
          <button 
            type="button" 
            className="modal-close-btn"
            onClick={handleClose}
            disabled={importStatus === 'importing'}
          >
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {importStatus === 'success' && importResults ? (
            <div className="import-results">
              <CheckCircle size={48} className="success-icon" />
              <h3>Import Complete!</h3>
              
              <div className="results-summary">
                <div className="result-item success">
                  <CheckCircle size={20} />
                  <span>Successfully imported: {importResults.successfulImports}</span>
                </div>
                
                {importResults.failedImports > 0 && (
                  <div className="result-item warning">
                    <AlertTriangle size={20} />
                    <span>Failed to import: {importResults.failedImports}</span>
                  </div>
                )}
                
                <div className="result-item info">
                  <span>Total records processed: {importResults.totalRecords}</span>
                </div>
              </div>

              {importResults.errors && importResults.errors.length > 0 && (
                <div className="import-errors">
                  <h4>Import Errors:</h4>
                  <div className="error-list">
                    {importResults.errors.slice(0, 10).map((error, index) => (
                      <div key={index} className="error-item">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                      </div>
                    ))}
                    {importResults.errors.length > 10 && (
                      <div className="error-item">
                        <span>... and {importResults.errors.length - 10} more errors</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Instructions */}
              <div className="import-instructions">
                <h3>Instructions</h3>
                <ol>
                  <li>Download the CSV template to see the required format</li>
                  <li>Fill in your expense data using the template</li>
                  <li>Upload your completed CSV file below</li>
                </ol>
                <button 
                  type="button" 
                  className="btn btn-outline download-template-btn"
                  onClick={downloadTemplate}
                >
                  <Download size={16} />
                  Download Template
                </button>
              </div>

              {/* File Drop Zone */}
              <div 
                className={`file-drop-zone ${selectedFile ? 'has-file' : ''} ${importStatus === 'importing' ? 'importing' : ''}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  disabled={importStatus === 'importing'}
                />

                {selectedFile ? (
                  <div className="selected-file">
                    <FileText size={24} className="text-green-500" />
                    <div className="file-details">
                      <div className="file-name">{selectedFile.name}</div>
                      <div className="file-size">{formatFileSize(selectedFile.size)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="drop-zone-content">
                    <Upload size={48} className="upload-icon" />
                    <h3>Drop your CSV file here</h3>
                    <p>or click to select a file</p>
                    <div className="file-requirements">
                      <small>Only CSV files are supported (max 50MB)</small>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="import-error">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Import Progress */}
              {importStatus === 'importing' && (
                <div className="import-progress">
                  <div className="progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                  <p>Processing your CSV file...</p>
                </div>
              )}
            </>
          )}
        </div>

        {importStatus !== 'success' && (
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={importStatus === 'importing'}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleImport}
              disabled={!selectedFile || importStatus === 'importing'}
            >
              {importStatus === 'importing' ? 'Importing...' : 'Import Expenses'}
            </button>
          </div>
        )}

        {importStatus === 'success' && (
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkImportModal;