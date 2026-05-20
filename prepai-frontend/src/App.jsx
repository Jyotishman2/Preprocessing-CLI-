import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import './App.css';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeFile, setActiveFile] = useState(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Animated Sidebar */}
        <motion.aside
          className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}
          initial={{ x: -300 }}
          animate={{ x: isSidebarOpen ? 0 : -300 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="sidebar-header">
            <div className="logo">
              <span className="logo-icon">📊</span>
              <span className="logo-text">PrepAI</span>
            </div>
            <button
              className="close-sidebar"
              onClick={toggleSidebar}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          <nav className="sidebar-nav">
            <a href="/" className="nav-item active">
              <span className="nav-icon">🏠</span>
              <span className="nav-label">Upload</span>
            </a>
            {activeFile && (
              <a href="/dashboard" className="nav-item">
                <span className="nav-icon">📈</span>
                <span className="nav-label">Dashboard</span>
              </a>
            )}
            <a href="#" className="nav-item">
              <span className="nav-icon">⚙️</span>
              <span className="nav-label">Settings</span>
            </a>
            <a href="#" className="nav-item">
              <span className="nav-icon">📚</span>
              <span className="nav-label">Docs</span>
            </a>
          </nav>

          <div className="sidebar-footer">
            <p className="text-xs text-gray-400">v1.0.0</p>
          </div>
        </motion.aside>

        {/* Backdrop overlay when sidebar is open on mobile */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              className="sidebar-backdrop"
              onClick={toggleSidebar}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="main-content">
          {/* Header with toggle button */}
          <header className="main-header">
            <button
              className="menu-toggle"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <h1 className="page-title">PrepAI</h1>
            <div className="header-spacer" />
          </header>

          {/* Page Routes */}
          <AnimatePresence mode="wait">
            <Routes>
              <Route
                path="/"
                element={
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Home onFileUpload={setActiveFile} />
                  </motion.div>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Dashboard filename={activeFile} />
                  </motion.div>
                }
              />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </BrowserRouter>
  );
}
