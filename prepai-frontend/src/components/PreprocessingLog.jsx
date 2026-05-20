import { motion } from 'framer-motion';

import './PreprocessingLog.css';

export default function PreprocessingLog({
  steps,
}) {

  // =====================================================
  // DEFAULT EMPTY STATE
  // =====================================================

  if (!steps || steps.length === 0) {

    return (

      <div
        style={{
          color: '#a0aec0',
          padding: '20px',
        }}
      >
        No preprocessing steps available
      </div>
    );
  }

  // =====================================================
  // ICON MAP
  // =====================================================

  const iconMap = {

    'clean-text': '🧹',

    'fill-missing': '🔧',

    'remove-duplicates': '🗑️',

    'remove-outliers': '⚠️',

    'encode-categorical': '🏷️',

    'scale-features': '📏',

    'drop-variance': '📉',
  };

  // =====================================================
  // PROGRESS
  // =====================================================

  const completedSteps =
    steps.filter(
      (step) =>
        step.status === 'completed'
    ).length;

  const progressPercent =
    Math.round(
      (completedSteps / steps.length) * 100
    );

  // =====================================================
  // UI
  // =====================================================

  return (

    <motion.div
      className="preprocessing-log-container"

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
      {/* HEADER */}
      {/* ===================================== */}

      <h3 className="log-title">

        ⚙️ Processing Pipeline

      </h3>

      <p className="log-subtitle">

        Real preprocessing operations
        performed on your dataset

      </p>

      {/* ===================================== */}
      {/* TIMELINE */}
      {/* ===================================== */}

      <div className="steps-timeline">

        {steps.map((step, idx) => {

          const isLast =
            idx === steps.length - 1;

          const icon =
            iconMap[step.step] || '📌';

          return (

            <div
              key={idx}
              className="step-item"
            >

              {/* =============================== */}
              {/* CONNECTOR */}
              {/* =============================== */}

              {!isLast && (

                <motion.div
                  className={`
                    step-connector
                    ${step.status}
                  `}

                  initial={{
                    scaleY: 0,
                  }}

                  animate={{
                    scaleY: 1,
                  }}

                  transition={{
                    duration: 0.4,
                    delay: idx * 0.1,
                  }}
                />

              )}

              {/* =============================== */}
              {/* STEP NODE */}
              {/* =============================== */}

              <motion.div
                className={`
                  step-node
                  ${step.status}
                `}

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
                  delay: idx * 0.1,
                }}
              >

                {step.status === 'completed' ? (

                  <motion.span
                    initial={{
                      scale: 0,
                    }}

                    animate={{
                      scale: 1,
                    }}
                  >
                    ✓
                  </motion.span>

                ) : step.status === 'failed' ? (

                  <span>
                    ❌
                  </span>

                ) : (

                  <span>
                    {icon}
                  </span>

                )}

              </motion.div>

              {/* =============================== */}
              {/* STEP CONTENT */}
              {/* =============================== */}

              <motion.div
                className={`
                  step-content
                  ${step.status}
                `}

                initial={{
                  opacity: 0,
                  x: -10,
                }}

                animate={{
                  opacity: 1,
                  x: 0,
                }}

                transition={{
                  duration: 0.3,
                  delay: idx * 0.1,
                }}
              >

                {/* STEP NAME */}

                <p className="step-name">

                  {step.step
                    ?.replaceAll('-', ' ')
                    ?.toUpperCase()}

                </p>

                {/* STEP MESSAGE */}

                <p className="step-message">

                  {step.message}

                </p>

                {/* STATUS */}

                <p
                  className={`
                    step-status
                    ${step.status}
                  `}
                >

                  {step.status}

                </p>

                {/* EXTRA DETAILS */}

                {step.columns_encoded && (

                  <div
                    className="step-extra"
                  >

                    <strong>
                      Encoded:
                    </strong>

                    {' '}

                    {step.columns_encoded.join(
                      ', '
                    )}

                  </div>

                )}

                {step.columns_scaled && (

                  <div
                    className="step-extra"
                  >

                    <strong>
                      Scaled:
                    </strong>

                    {' '}

                    {step.columns_scaled.join(
                      ', '
                    )}

                  </div>

                )}

                {step.columns_dropped &&
                  step.columns_dropped.length > 0 && (

                  <div
                    className="step-extra"
                  >

                    <strong>
                      Dropped:
                    </strong>

                    {' '}

                    {step.columns_dropped.join(
                      ', '
                    )}

                  </div>

                )}

              </motion.div>

            </div>
          );
        })}

      </div>

      {/* ===================================== */}
      {/* PROGRESS BAR */}
      {/* ===================================== */}

      <div className="progress-section">

        <div className="progress-info">

          <span className="progress-label">

            Overall Progress

          </span>

          <span className="progress-percent">

            {progressPercent}%

          </span>

        </div>

        <div className="progress-bar-large">

          <motion.div
            className="progress-fill-large"

            initial={{
              width: 0,
            }}

            animate={{
              width: `${progressPercent}%`,
            }}

            transition={{
              duration: 0.5,
            }}
          />

        </div>

      </div>

    </motion.div>
  );
}