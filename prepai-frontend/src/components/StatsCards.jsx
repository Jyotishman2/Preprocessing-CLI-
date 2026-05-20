import { motion } from 'framer-motion';

import './StatsCards.css';

export default function StatsCards({
  stats,
}) {

  // =====================================================
  // LOADING / EMPTY STATE
  // =====================================================

  if (!stats) {

    return (

      <div
        style={{
          color: '#a0aec0',
          padding: '20px',
          fontSize: '16px',
        }}
      >
        Loading statistics...
      </div>
    );
  }

  // =====================================================
  // CARD DATA
  // =====================================================

  const cards = [

    {
      icon: '📊',
      label: 'Total Rows',
      value:
        stats.row_count ?? 0,

      color: 'cyan',
    },

    {
      icon: '📋',
      label: 'Total Columns',
      value:
        stats.column_count ?? 0,

      color: 'violet',
    },

    {
      icon: '❌',
      label: 'Missing Values',

      value: `${
        Number(
          stats.missing_percentage || 0
        ).toFixed(1)
      }%`,

      color: 'orange',
    },

    {
      icon: '⚠️',
      label: 'Duplicates',

      value:
        stats.duplicate_count ?? 0,

      color: 'red',
    },

    {
      icon: '📈',
      label: 'Numerical Columns',

      value:
        stats.numerical_columns ?? 0,

      color: 'green',
    },

    {
      icon: '🏷️',
      label: 'Categorical Columns',

      value:
        stats.categorical_columns ?? 0,

      color: 'blue',
    },
  ];

  // =====================================================
  // ANIMATION
  // =====================================================

  const container = {

    hidden: {
      opacity: 0,
    },

    show: {

      opacity: 1,

      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {

    hidden: {
      opacity: 0,
      y: 20,
    },

    show: {
      opacity: 1,
      y: 0,
    },
  };

  // =====================================================
  // UI
  // =====================================================

  return (

    <motion.div
      className="stats-cards-container"

      variants={container}

      initial="hidden"

      animate="show"
    >

      {cards.map((card, idx) => (

        <motion.div
          key={idx}

          className={`
            stat-card
            stat-${card.color}
          `}

          variants={item}

          whileHover={{
            scale: 1.05,
            translateY: -5,
          }}

          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
          }}
        >

          {/* ================================= */}
          {/* ICON */}
          {/* ================================= */}

          <div className="card-icon">

            {card.icon}

          </div>

          {/* ================================= */}
          {/* CONTENT */}
          {/* ================================= */}

          <div className="card-content">

            <p className="card-label">

              {card.label}

            </p>

            <motion.p
              className="card-value"

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
            >

              {card.value}

            </motion.p>

          </div>

        </motion.div>

      ))}

    </motion.div>
  );
}