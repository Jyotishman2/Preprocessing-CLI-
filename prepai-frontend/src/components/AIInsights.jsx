import {
  useState,
  useEffect,
} from 'react';

import { motion } from 'framer-motion';

import './AIInsights.css';

export default function AIInsights({
  insights,
}) {

  // =====================================================
  // STATES
  // =====================================================

  const [displayedText, setDisplayedText] =
    useState('');

  const [currentIndex, setCurrentIndex] =
    useState(0);

  // =====================================================
  // EMPTY STATE
  // =====================================================

  if (!insights) {

    return (

      <div
        style={{
          color: '#a0aec0',
          padding: '20px',
        }}
      >
        Loading AI insights...
      </div>
    );
  }

  // =====================================================
  // SAFE DATA
  // =====================================================

  const data = {

    quality_score:
      insights.quality_score ?? 75,

    quality_feedback:
      insights.quality_feedback ??
      'Dataset analyzed successfully',

    suggestions:
      insights.suggestions ?? [],

    model_recommendations:
      insights.model_recommendations ?? [],

    feature_engineering:
      insights.feature_engineering ?? [],
  };

  // =====================================================
  // TYPEWRITER TEXT
  // =====================================================

  const fullText =
    data.suggestions[0] ||
    'No suggestions available';

  // =====================================================
  // RESET TYPEWRITER
  // =====================================================

  useEffect(() => {

    setDisplayedText('');

    setCurrentIndex(0);

  }, [fullText]);

  // =====================================================
  // TYPEWRITER EFFECT
  // =====================================================

  useEffect(() => {

    if (
      currentIndex < fullText.length
    ) {

      const timer = setTimeout(() => {

        setDisplayedText(

          fullText.slice(
            0,
            currentIndex + 1
          )
        );

        setCurrentIndex(
          currentIndex + 1
        );

      }, 25);

      return () => clearTimeout(timer);
    }

  }, [
    currentIndex,
    fullText,
  ]);

  // =====================================================
  // QUALITY COLOR
  // =====================================================

  const getQualityColor = () => {

    if (data.quality_score >= 85)
      return '#00ff99';

    if (data.quality_score >= 70)
      return '#00d4ff';

    if (data.quality_score >= 50)
      return '#ffaa00';

    return '#ff4d4f';
  };

  // =====================================================
  // UI
  // =====================================================

  return (

    <motion.div
      className="ai-insights-container"

      initial={{
        opacity: 0,
        y: 20,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      transition={{
        duration: 0.5,
      }}
    >

      {/* ===================================== */}
      {/* QUALITY SCORE */}
      {/* ===================================== */}

      <div className="quality-score-section">

        <div className="quality-header">

          <h3 className="quality-title">

            📊 Data Quality Score

          </h3>

          <div className="quality-badge">

            <motion.span
              className="quality-value"

              style={{
                color:
                  getQualityColor(),
              }}

              initial={{
                scale: 0,
              }}

              animate={{
                scale: 1,
              }}

              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
            >

              {data.quality_score}

            </motion.span>

            <span className="quality-max">

              /100

            </span>

          </div>

        </div>

        {/* ================================= */}
        {/* PROGRESS BAR */}
        {/* ================================= */}

        <div className="quality-bar-bg">

          <motion.div
            className="quality-bar-fill"

            initial={{
              width: 0,
            }}

            animate={{
              width: `${data.quality_score}%`,
            }}

            transition={{
              duration: 1,
              ease: 'easeOut',
            }}
          />

        </div>

        {/* ================================= */}
        {/* FEEDBACK */}
        {/* ================================= */}

        <p className="quality-feedback">

          {data.quality_feedback}

        </p>

      </div>

      {/* ===================================== */}
      {/* SMART SUGGESTIONS */}
      {/* ===================================== */}

      <div className="suggestions-section">

        <h4 className="section-title">

          💡 Smart Suggestions

        </h4>

        {/* TYPEWRITER */}

        <div className="suggestion-card">

          <motion.div
            className="typewriter-text"

            initial={{
              opacity: 0,
            }}

            animate={{
              opacity: 1,
            }}

            transition={{
              duration: 0.3,
            }}
          >

            {displayedText}

            <motion.span
              className="cursor"

              animate={{
                opacity: [1, 0],
              }}

              transition={{
                duration: 0.8,
                repeat: Infinity,
              }}
            >
              _
            </motion.span>

          </motion.div>

        </div>

        {/* ================================= */}
        {/* EXTRA SUGGESTIONS */}
        {/* ================================= */}

        {data.suggestions.length > 1 && (

          <div className="additional-suggestions">

            {data.suggestions
              .slice(1)
              .map((suggestion, idx) => (

              <motion.div
                key={idx}

                className="suggestion-item"

                initial={{
                  opacity: 0,
                  x: -10,
                }}

                animate={{
                  opacity: 1,
                  x: 0,
                }}

                transition={{
                  delay:
                    0.5 + idx * 0.1,
                }}
              >

                <span className="suggestion-icon">

                  →

                </span>

                <span className="suggestion-text">

                  {suggestion}

                </span>

              </motion.div>

            ))}

          </div>
        )}

      </div>

      {/* ===================================== */}
      {/* MODEL RECOMMENDATIONS */}
      {/* ===================================== */}

      {data.model_recommendations
        ?.length > 0 && (

        <div className="recommendations-section">

          <h4 className="section-title">

            🤖 Model Recommendations

          </h4>

          <div className="recommendation-grid">

            {data.model_recommendations.map(
              (model, idx) => (

              <motion.div
                key={idx}

                className="recommendation-chip"

                initial={{
                  opacity: 0,
                  scale: 0.8,
                }}

                animate={{
                  opacity: 1,
                  scale: 1,
                }}

                transition={{
                  delay: idx * 0.1,
                }}

                whileHover={{
                  scale: 1.05,
                }}
              >

                {model}

              </motion.div>

            ))}

          </div>

        </div>
      )}

      {/* ===================================== */}
      {/* FEATURE ENGINEERING */}
      {/* ===================================== */}

      {data.feature_engineering
        ?.length > 0 && (

        <div className="feature-engineering-section">

          <h4 className="section-title">

            ⚡ Feature Engineering Ideas

          </h4>

          <div className="feature-list">

            {data.feature_engineering.map(
              (feature, idx) => (

              <motion.div
                key={idx}

                className="feature-item"

                initial={{
                  opacity: 0,
                  x: -10,
                }}

                animate={{
                  opacity: 1,
                  x: 0,
                }}

                transition={{
                  delay: idx * 0.1,
                }}
              >

                <span className="feature-index">

                  {idx + 1}

                </span>

                <span className="feature-text">

                  {feature}

                </span>

              </motion.div>

            ))}

          </div>

        </div>
      )}

    </motion.div>
  );
}