import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle } from 'lucide-react';
import { useAuthToken } from '../service/authService';
import { API_BASE_URL } from '../config/apiconfig';
import apiClient from '../service/apiclient';
import toast from "react-hot-toast";
import { showSuccess } from '../utils/toast';
export default function UploadFile({ onUploadSuccess }) {
  // const { getToken } = useAuthToken();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState(null); // 'success' or 'error'
  const [selectedFile, setSelectedFile] = useState(null);

  const handleUpload = async () => {

    if (!selectedFile) return;
    setIsUploading(true);
    setStatus(null);


    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // const token = await getToken();
      // const res = await axios.post(`${API_BASE_URL}/document/upload`, formData, {
      //   // headers: {
      //   //   Authorization: `Bearer ${token}`
      //   // }
      // });
      const res = await apiClient.post(`/document/upload`, formData);
      setStatus('success');
      console.log("🔥 Toast should fire now");
      showSuccess("Document uploaded successfully 🚀");
      setSelectedFile(null);
      if (onUploadSuccess) onUploadSuccess(res.data.data);

      // Clear status after 3 seconds
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      console.error('Error uploading document:', error);
      setStatus('error');
      toast.error("Upload failed ❌");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setStatus(null);
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
    setSelectedFile(file);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
        <UploadCloud size={20} /> Upload Document
      </h3>

      {/*  DROP ZONE */}
      <div
        className={`file-upload-wrapper ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".docx"
          onChange={(e) => handleFileSelect(e.target.files[0])}
          disabled={isUploading}
        />

        {isUploading ? (
          <div>Uploading...</div>
        ) : status === 'success' ? (
          <div style={{ color: '#4ade80', textAlign: 'center' }}>
            <CheckCircle size={32} />
            <div>Upload Successful</div>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
            <div>Click or drag file to this area</div>
            <small>Supports .DOCX files</small>
          </div>
        )}
      </div>

      {/*  FILE INFO (OUTSIDE BOX) */}
      {selectedFile && (
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <div style={{ marginBottom: '10px', fontWeight: '500' }}>
            📄 {selectedFile.name}
          </div>

          {/* BUTTONS OUTSIDE */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>

        
            <button
              onClick={handleUpload}
              disabled={isUploading}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                background: isUploading
                  ? 'rgba(255,255,255,0.2)'
                  : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!isUploading)
                  e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Upload
            </button>

            {/* Cancel Button */}
            <button
              onClick={handleCancel}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.05)',
                color: '#f87171',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(6px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(248,113,113,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.05)';
              }}
            >
              Cancel
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
