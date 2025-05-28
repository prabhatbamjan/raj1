import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import LivestockRecords from './components/LivestockRecords';
import MedicalRecords from './components/MedicalRecords';
import FinanceAnalytics from './components/FinanceAnalytics';
import PestManagement from './components/PestManagement';
import CropAnalytics from './pages/CropAnalytics';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/livestock" element={<LivestockRecords />} />
            <Route path="/medical" element={<MedicalRecords />} />
            <Route path="/finance" element={<FinanceAnalytics />} />
            <Route path="/pest-management" element={<PestManagement />} />
            <Route path="/crop-analytics" element={<CropAnalytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 