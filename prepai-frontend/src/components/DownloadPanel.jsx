import { useState } from 'react';

import { motion } from 'framer-motion';

import {
  downloadCleanedCSV,
  downloadMLCSV,
  getReport,
  getVisualizations,
} from '../api/prepai';

import './DownloadPanel.css';

export default function DownloadPanel({ filename }) {

  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (type) => {

    setDownloading(type);

    try {

      let response;
      let fileName;

      switch (type) {

        // ==========================
        // CLEAN DATASET
        // ==========================
        case 'clean':

        response = await downloadCleanedCSV(
  filename
);
         fileName = filename;

          break;

        // ==========================
        // ML DATASET
        // ==========================
        case 'ml':

         response = await downloadMLCSV(
  filename.replace(
    'cleaned_',
    'ml_ready_'
  )
);

         fileName = filename.replace(
  'cleaned_',
  'ml_ready_'
);

          break;

        // ==========================
        // JSON REPORT
        // ==========================
        case 'report':

          response = await getReport(filename);

          fileName = `${filename.replace(/\.[^/.]+$/, '')}_report.json`;

          break;

        // ==========================
        // HTML VISUALIZATION
        // ==========================
        case 'html':

          response = await getVisualizations(filename);

          fileName = `${filename.replace(/\.[^/.]+$/, '')}_visualizations.json`;

          break;

        default:
          return;
      }

      // ==========================
      // DOWNLOAD FILE
      // ==========================
      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = document.createElement('a');

      link.href = url;

      link.setAttribute('download', fileName);

      document.body.appendChild(link);

      link.click();

      link.parentNode.removeChild(link);

      window.URL.revokeObjectURL(url);

    } catch (error) {

      console.error(`Download failed for ${type}:`, error);

      alert(`Failed to download ${type}`);

    } finally {

      setDownloading(null);
    }
  };

  // =====================================
  // DOWNLOAD OPTIONS
  // =====================================

  const downloadOptions = [

    {
      id: 'clean',
      name: 'Clean Dataset',
      description: 'Human readable cleaned dataset',
      icon: '📄',
      color: 'cyan',
    },

    {
      id: 'ml',
      name: 'ML Dataset',
      description: 'Encoded and scaled ML-ready dataset',
      icon: '🤖',
      color: 'orange',
    },

    {
      id: 'report',
      name: 'JSON Report',
      description: 'Complete preprocessing report',
      icon: '📋',
      color: 'violet',
    },

    {
      id: 'html',
      name: 'Visualization Data',
      description: 'EDA and chart data',
      icon: '📈',
      color: 'green',
    },
  ];

  // =====================================
  // FRAMER ANIMATION
  // =====================================

  const container = {
    hidden: { opacity: 0 },

    show: {
      opacity: 1,

      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },

    show: { opacity: 1, y: 0 },
  };

  return (

    <motion.div
      className="download-panel-container"
      variants={container}
      initial="hidden"
      animate="show"
    >

      <h3 className="panel-title">
        📥 Downloads
      </h3>

      <p className="panel-subtitle">
        Export your preprocessing results
      </p>

      {/* DOWNLOAD GRID */}

      <motion.div
        className="download-grid"
        variants={container}
        initial="hidden"
        animate="show"
      >

        {downloadOptions.map((option) => (

          <motion.button
            key={option.id}
            className={`download-button download-${option.color}`}
            variants={item}
            whileHover={{
              scale: 1.05,
              translateY: -5,
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDownload(option.id)}
            disabled={downloading !== null}
          >

            {downloading === option.id ? (

              <motion.span
                className="download-spinner"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                ⚙️
              </motion.span>

            ) : (

              <span className="download-icon">
                {option.icon}
              </span>

            )}

            <div className="download-content">

              <p className="download-name">
                {option.name}
              </p>

              <p className="download-description">
                {option.description}
              </p>

            </div>

            <span className="download-arrow">
              →
            </span>

          </motion.button>

        ))}

      </motion.div>

      {/* ================================= */}
      {/* COPY PYTHON CODE BUTTON */}
      {/* ================================= */}

      <motion.button
        className="copy-pipeline-button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {

          const code = `
import pandas as pd

# Load ML-ready dataset
df = pd.read_csv('ml_ready_${filename}')

# Features ready for ML
X = df.values

print(df.head())
`;

          navigator.clipboard.writeText(code);

          alert('Python code copied!');
        }}
      >

        <span className="pipeline-icon">
          🐍
        </span>

        <span className="pipeline-text">
          Copy ML Python Script
        </span>

      </motion.button>

    </motion.div>
  );
}