import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

// ======================================================
// AXIOS CLIENT
// ======================================================

const apiClient = axios.create({

  baseURL: API_BASE,

  headers: {
    'Content-Type': 'application/json',
  },
});

// ======================================================
// UPLOAD FILE
// ======================================================

export const uploadFile = async (
  file,
  onProgress
) => {

  const formData = new FormData();

  formData.append(
    'file',
    file
  );

  return apiClient.post(
    '/upload',
    formData,
    {

      headers: {
        'Content-Type':
          'multipart/form-data',
      },

      onUploadProgress:
        (progressEvent) => {

        const percentCompleted =
          Math.round(

            (progressEvent.loaded * 100) /

            progressEvent.total
          );

        if (onProgress) {

          onProgress(
            percentCompleted
          );
        }
      },
    }
  );
};

// ======================================================
// DATASET SUMMARY
// ======================================================

export const getSummary = async (
  filename
) => {

  return apiClient.get(
    `/summary/${filename}`
  );
};

// ======================================================
// RUN PREPROCESSING
// ======================================================

export const preprocessData = async (
  filename,
  config
) => {

  return apiClient.post(
    `/preprocess/${filename}`,
    config
  );
};

// ======================================================
// DOWNLOAD CLEAN DATASET
// ======================================================

export const downloadCleanedCSV =
  async (filename) => {

  return apiClient.get(
    `/download/${filename}`,
    {
      responseType: 'blob',
    }
  );
};

// ======================================================
// DOWNLOAD ML DATASET
// ======================================================

export const downloadMLCSV =
  async (filename) => {

  return apiClient.get(
    `/download/${filename}`,
    {
      responseType: 'blob',
    }
  );
};

// ======================================================
// DOWNLOAD REPORT
// ======================================================

export const getReport = async (
  filename
) => {

  return apiClient.get(
    `/report/${filename}`,
    {
      responseType: 'blob',
    }
  );
};

// ======================================================
// GET VISUALIZATIONS
// ======================================================

export const getVisualizations =
  async (filename) => {

  return apiClient.get(
    `/visualizations/${filename}`
  );
};

// ======================================================
// GET AI SUGGESTIONS
// ======================================================

export const getAISuggestions =
  async (filename) => {

  return apiClient.get(
    `/ai-suggestions/${filename}`
  );
};

// ======================================================
// GET DATA PREVIEW
// ======================================================

export const getPreviewData =
  async (filename) => {

  return apiClient.get(
    `/preview/${filename}`
  );
};

// ======================================================
// DEFAULT EXPORT
// ======================================================

export default apiClient;