import { useState, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

import { useNavigate } from 'react-router-dom';

import {
  uploadFile,
  preprocessData,
} from '../api/prepai';

import './UploadZone.css';

export default function UploadZone({
  onFileUpload,
}) {

  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================

  const [isDragging, setIsDragging] =
    useState(false);

  const [isUploading, setIsUploading] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState(0);

  const [uploadedFile, setUploadedFile] =
    useState(null);

  const [error, setError] =
    useState(null);

  const fileInputRef = useRef(null);

  // ==========================================
  // DRAG EVENTS
  // ==========================================

  const handleDragEnter = (e) => {

    e.preventDefault();

    e.stopPropagation();

    setIsDragging(true);
  };

  const handleDragLeave = (e) => {

    e.preventDefault();

    e.stopPropagation();

    setIsDragging(false);
  };

  const handleDrop = (e) => {

    e.preventDefault();

    e.stopPropagation();

    setIsDragging(false);

    const files = e.dataTransfer.files;

    if (files.length > 0) {

      handleFile(files[0]);
    }
  };

  // ==========================================
  // FILE INPUT
  // ==========================================

  const handleFileInputChange = (e) => {

    if (
      e.target.files &&
      e.target.files.length > 0
    ) {

      handleFile(e.target.files[0]);
    }
  };

  // ==========================================
  // MAIN FILE HANDLER
  // ==========================================

  const handleFile = async (file) => {

    setError(null);

    // ======================================
    // VALIDATE FILE TYPE
    // ======================================

    const validTypes = [

      'text/csv',

      'application/vnd.ms-excel',

      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!validTypes.includes(file.type)) {

      setError(
        'Please upload a CSV or Excel file'
      );

      return;
    }

    // ======================================
    // VALIDATE FILE SIZE
    // ======================================

    if (file.size > 50 * 1024 * 1024) {

      setError(
        'File size must be less than 50MB'
      );

      return;
    }

    // ======================================
    // START UPLOAD
    // ======================================

    setIsUploading(true);

    setUploadProgress(0);

    try {

      // ====================================
      // STEP 1 → UPLOAD FILE
      // ====================================

      const uploadResponse = await uploadFile(
        file,
        setUploadProgress
      );

      console.log(
        'UPLOAD RESPONSE:',
        uploadResponse.data
      );

      const uploadedFilename =
        uploadResponse.data.filename;

      // ====================================
      // STEP 2 → PREPROCESS DATA
      // ====================================

      const preprocessResponse =
        await preprocessData(
          uploadedFilename,
          {

            fill_strategy: 'mean',

            scaling_method: 'standard',

            outlier_threshold: 1.5,

            variance_threshold: 0.01,

            remove_duplicates: true,

            encode_categorical: true,
          }
        );

      console.log(
        'PREPROCESS RESPONSE:',
        preprocessResponse.data
      );

      // ====================================
      // IMPORTANT
      // CLEAN FILE FOR DASHBOARD
      // ====================================

      const cleanFilename =
        preprocessResponse.data.cleaned_file;

      // ====================================
      // UPDATE STATES
      // ====================================

      setUploadedFile(cleanFilename);

      // VERY IMPORTANT
      // GLOBAL STATE UPDATE

      if (onFileUpload) {

        onFileUpload(cleanFilename);
      }

      setIsUploading(false);

      // ====================================
      // REDIRECT
      // ====================================

      setTimeout(() => {

        navigate('/dashboard');

      }, 1200);

    } catch (err) {

      console.error(err);

      setError(

        err.response?.data?.detail ||

        err.message ||

        'Upload failed. Please try again.'
      );

      setIsUploading(false);

      setUploadProgress(0);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (

    <motion.div
      className="upload-zone-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >

      {/* =================================== */}
      {/* MAIN UPLOAD ZONE */}
      {/* =================================== */}

      <motion.div
        className={`upload-zone ${
          isDragging ? 'dragging' : ''
        } ${
          uploadedFile ? 'success' : ''
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        whileHover={{
          scale: isDragging ? 1 : 1.02,
        }}
        whileTap={{ scale: 0.98 }}
      >

        {/* ================================= */}
        {/* DEFAULT STATE */}
        {/* ================================= */}

        {!isUploading &&
          !uploadedFile && (

          <>

            <div className="upload-icon">
              📁
            </div>

            <h3 className="upload-title">
              Drag & drop your dataset here
            </h3>

            <p className="upload-subtitle">
              or
            </p>

            <button
              className="upload-button"
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              Browse Files
            </button>

            <p className="upload-hint">
              CSV, XLSX, XLS supported
              • Max 50MB
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />

          </>
        )}

        {/* ================================= */}
        {/* UPLOADING STATE */}
        {/* ================================= */}

        <AnimatePresence mode="wait">

          {isUploading && (

            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="uploading-state"
            >

              <div className="upload-spinner">

                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="spinner-circle"
                />

              </div>

              <p className="uploading-text">

                Uploading & preprocessing...

                {' '}

                {uploadProgress}%

              </p>

              <div className="progress-bar">

                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${uploadProgress}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />

              </div>

            </motion.div>
          )}

          {/* ================================= */}
          {/* SUCCESS STATE */}
          {/* ================================= */}

          {uploadedFile &&
            !isUploading &&
            !error && (

            <motion.div
              key="success"
              initial={{
                opacity: 0,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{ opacity: 0 }}
              className="success-state"
            >

              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
                className="success-icon"
              >
                ✓
              </motion.div>

              <p className="success-text">
                Dataset processed successfully!
              </p>

              <p className="uploaded-filename">
                {uploadedFile}
              </p>

              <p className="redirect-text">
                Redirecting to dashboard...
              </p>

            </motion.div>
          )}

        </AnimatePresence>

      </motion.div>

      {/* =================================== */}
      {/* ERROR MESSAGE */}
      {/* =================================== */}

      <AnimatePresence>

        {error && (

          <motion.div
            className="error-message"
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
          >

            <span className="error-icon">
              ⚠️
            </span>

            <span className="error-text">
              {error}
            </span>

            <button
              className="error-close"
              onClick={() => setError(null)}
            >
              ✕
            </button>

          </motion.div>
        )}

      </AnimatePresence>

    </motion.div>
  );
}