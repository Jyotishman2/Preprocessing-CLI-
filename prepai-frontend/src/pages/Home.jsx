import { motion } from 'framer-motion';

import UploadZone from '../components/UploadZone';

export default function Home({ onFileUpload }) {

  return (

    <div className="page-content">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >

        <h2
          style={{
            fontSize: '32px',
            marginBottom: '12px',
            color: '#fff',
          }}
        >
          Upload Your Data
        </h2>

        <p
          style={{
            fontSize: '16px',
            color: '#a0aec0',
            marginBottom: '40px',
          }}
        >
          Drag & drop or select a CSV/Excel file
          to start preprocessing and analysis
        </p>

        {/* IMPORTANT */}
        <UploadZone
          onFileUpload={onFileUpload}
        />

      </motion.div>

    </div>
  );
}