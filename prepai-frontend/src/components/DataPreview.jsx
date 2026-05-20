import { motion } from 'framer-motion';

import './DataPreview.css';

export default function DataPreview({
  data,
  title = 'Dataset Preview',
}) {

  // =====================================================
  // EMPTY STATE
  // =====================================================

  if (
    !data ||
    !data.rows ||
    data.rows.length === 0
  ) {

    return (

      <div className="data-preview-container">

        <h3 className="preview-title">

          {title}

        </h3>

        <div className="empty-state">

          <p>
            No data available
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // DATA
  // =====================================================

  const columns =
    data.columns || [];

  const rows =
    data.rows || [];

  // =====================================================
  // FORMAT CELL VALUE
  // =====================================================

  const formatValue = (value) => {

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {

      return '-';
    }

    // FLOAT FORMAT
    if (
      typeof value === 'number'
    ) {

      if (
        Number.isInteger(value)
      ) {

        return value;
      }

      return value.toFixed(3);
    }

    return String(value);
  };

  // =====================================================
  // UI
  // =====================================================

  return (

    <motion.div
      className="data-preview-container"

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

      <h3 className="preview-title">

        {title}

      </h3>

      <p className="preview-subtitle">

        Showing{' '}

        <strong>
          {rows.length}
        </strong>

        {' '}rows ×{' '}

        <strong>
          {columns.length}
        </strong>

        {' '}columns

      </p>

      {/* ===================================== */}
      {/* TABLE */}
      {/* ===================================== */}

      <div className="table-wrapper">

        <table className="data-table">

          {/* ================================= */}
          {/* HEADER */}
          {/* ================================= */}

          <thead>

            <tr>

              {columns.map(
                (col, idx) => (

                <th key={idx}>

                  <span className="col-name">

                    {col}

                  </span>

                </th>

              ))}

            </tr>

          </thead>

          {/* ================================= */}
          {/* BODY */}
          {/* ================================= */}

          <tbody>

            {rows
              .slice(0, 10)
              .map((row, rowIdx) => (

              <motion.tr
                key={rowIdx}

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
                    rowIdx * 0.05,
                }}
              >

                {columns.map(
                  (col, colIdx) => (

                  <td key={colIdx}>

                    <span className="cell-value">

                      {formatValue(
                        row[col]
                      )}

                    </span>

                  </td>

                ))}

              </motion.tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* ===================================== */}
      {/* FOOTER */}
      {/* ===================================== */}

      {rows.length > 10 && (

        <motion.p
          className="preview-note"

          initial={{
            opacity: 0,
          }}

          animate={{
            opacity: 1,
          }}
        >

          ... and{' '}

          <strong>

            {rows.length - 10}

          </strong>

          {' '}more rows

        </motion.p>

      )}

    </motion.div>
  );
}