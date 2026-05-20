import { useState, useEffect } from 'react';

import { motion } from 'framer-motion';

import StatsCards from '../components/StatsCards';
import DataPreview from '../components/DataPreview';
import PreprocessingLog from '../components/PreprocessingLog';
import AIInsights from '../components/AIInsights';
import DownloadPanel from '../components/DownloadPanel';

import {
  getSummary,
  getAISuggestions,
  getVisualizations,
  getPreviewData,
} from '../api/prepai';

export default function Dashboard({ filename }) {

  // =====================================================
  // STATES
  // =====================================================

  const [activeTab, setActiveTab] =
    useState('overview');

  const [loading, setLoading] =
    useState(true);

  const [stats, setStats] =
    useState(null);

  const [insights, setInsights] =
    useState(null);

  const [previewData, setPreviewData] =
    useState(null);

  const [preprocessingSteps, setPreprocessingSteps] =
    useState([]);

  const [visualizations, setVisualizations] =
    useState(null);

  // =====================================================
  // FETCH DATA
  // =====================================================

  useEffect(() => {

    if (!filename) return;

    fetchDashboardData();

  }, [filename]);

  // =====================================================
  // MAIN FETCH
  // =====================================================

 const fetchDashboardData = async () => {

  try {

    setLoading(true);

    // =====================================
    // ORIGINAL FILE
    // =====================================

    const originalFilename =
      filename.replace(
        'cleaned_',
        ''
      );

    console.log(
      'ORIGINAL:',
      originalFilename
    );

    // =====================================
    // SUMMARY
    // =====================================

    const summaryRes =
      await getSummary(
        originalFilename
      );

    console.log(
      'SUMMARY:',
      summaryRes.data
    );

    setStats(summaryRes.data);

    // =====================================
    // INSIGHTS
    // =====================================

    const insightsRes =
      await getAISuggestions(
        originalFilename
      );

    console.log(
      'INSIGHTS:',
      insightsRes.data
    );

    setInsights(
      insightsRes.data
    );

    // =====================================
    // PREVIEW
    // =====================================

    const previewRes =
      await getPreviewData(
        filename
      );

    console.log(
      'PREVIEW:',
      previewRes.data
    );

    setPreviewData(
      previewRes.data
    );

    // =====================================
    // PREPROCESS STEPS
    // =====================================

    if (
      insightsRes.data?.steps
    ) {

      setPreprocessingSteps(
        insightsRes.data.steps
      );

    } else {

      setPreprocessingSteps([
        {
          step:
            'pipeline-complete',

          status:
            'completed',

          message:
            'Dataset preprocessing completed successfully',
        },
      ]);
    }

  } catch (error) {

    console.error(
      'DASHBOARD ERROR:',
      error
    );

  } finally {

    setLoading(false);
  }
};

  // =====================================================
  // NO FILE
  // =====================================================

  if (!filename) {

    return (

      <div className="page-content">

        <h2 style={{ color: 'white' }}>
          No dataset uploaded yet
        </h2>

      </div>
    );
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="page-content">

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            color: 'white',
            fontSize: '24px',
          }}
        >
          Loading dashboard...
        </motion.div>

      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (

    <div className="page-content">

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >

        {/* ===================================== */}
        {/* HEADER */}
        {/* ===================================== */}

        <div
          style={{
            marginBottom: '32px',
          }}
        >

          <h2
            style={{
              fontSize: '32px',
              marginBottom: '8px',
              color: '#fff',
            }}
          >
            Data Analysis Dashboard
          </h2>

          <p
            style={{
              fontSize: '14px',
              color: '#a0aec0',
            }}
          >
            File:{' '}

            <span
              style={{
                color: '#00d4ff',
                fontFamily:
                  "'JetBrains Mono', monospace",
              }}
            >
              {filename}
            </span>

          </p>

        </div>

        {/* ===================================== */}
        {/* TABS */}
        {/* ===================================== */}

        <div
          style={{
            marginBottom: '24px',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >

          {[
            'overview',
            'preprocessing',
            'insights',
            'download',
          ].map((tab) => (

            <motion.button
              key={tab}
              onClick={() =>
                setActiveTab(tab)
              }
              style={{

                padding: '10px 20px',

                background:
                  activeTab === tab
                    ? 'rgba(0, 212, 255, 0.2)'
                    : 'transparent',

                border:
                  activeTab === tab
                    ? '1px solid #00d4ff'
                    : '1px solid rgba(0,212,255,0.3)',

                borderRadius: '8px',

                color:
                  activeTab === tab
                    ? '#00d4ff'
                    : '#a0aec0',

                cursor: 'pointer',

                textTransform: 'capitalize',
              }}
            >

              {tab}

            </motion.button>

          ))}

        </div>

        {/* ===================================== */}
        {/* OVERVIEW */}
        {/* ===================================== */}

        {activeTab === 'overview' && (

          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >

            <StatsCards
              stats={stats}
            />

            <DataPreview
              data={previewData}
              title="Dataset Preview"
            />

          </motion.div>

        )}

        {/* ===================================== */}
        {/* PREPROCESSING */}
        {/* ===================================== */}

        {activeTab === 'preprocessing' && (

          <motion.div
            key="preprocessing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >

            <PreprocessingLog
              steps={preprocessingSteps}
              currentStep="completed"
            />

          </motion.div>

        )}

        {/* ===================================== */}
        {/* INSIGHTS */}
        {/* ===================================== */}

        {activeTab === 'insights' && (

          <motion.div
            key="insights"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >

            <AIInsights
              insights={insights}
            />

          </motion.div>

        )}

        {/* ===================================== */}
        {/* DOWNLOAD */}
        {/* ===================================== */}

        {activeTab === 'download' && (

          <motion.div
            key="download"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >

            <DownloadPanel
              filename={filename}
            />

          </motion.div>

        )}

      </motion.div>

    </div>
  );
}