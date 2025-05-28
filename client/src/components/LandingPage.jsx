import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './LandingPage.css';

const LandingPage = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [financialData, setFinancialData] = useState({
    income: [],
    expenses: [],
    totalIncome: 0,
    totalExpenses: 0,
  });

  useEffect(() => {
    fetchFinancialData();
  }, [timeRange]);

  const fetchFinancialData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/finance?timeRange=${timeRange}`);
      setFinancialData(response.data);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    }
  };

  const calculateProfitLoss = () => {
    const profit = financialData.totalIncome - financialData.totalExpenses;
    return {
      value: profit,
      percentage: ((profit / financialData.totalIncome) * 100).toFixed(2),
    };
  };

  const profitLoss = calculateProfitLoss();

  return (
    <div className="landing-page">
      <header className="header">
        <h1>Farm Management System</h1>
        <nav>
          <Link to="/livestock" className="nav-link">Livestock Records</Link>
          <Link to="/medical" className="nav-link">Medical Records</Link>
          <Link to="/analytics" className="nav-link">Analytics</Link>
        </nav>
      </header>

      <main className="main-content">
        <section className="quick-stats">
          <div className="stat-card income">
            <h3>Total Income</h3>
            <p>${financialData.totalIncome.toLocaleString()}</p>
          </div>
          <div className="stat-card expenses">
            <h3>Total Expenses</h3>
            <p>${financialData.totalExpenses.toLocaleString()}</p>
          </div>
          <div className={`stat-card profit-loss ${profitLoss.value >= 0 ? 'positive' : 'negative'}`}>
            <h3>Profit/Loss</h3>
            <p>${profitLoss.value.toLocaleString()}</p>
            <span className="percentage">{profitLoss.percentage}%</span>
          </div>
        </section>

        <section className="analytics-section">
          <div className="section-header">
            <h2>Financial Overview</h2>
            <div className="time-range-selector">
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialData.income}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#2ecc71" name="Income" />
                <Bar dataKey="expenses" fill="#e74c3c" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-grid">
            <Link to="/livestock/feeding" className="action-card">
              <i className="fas fa-utensils"></i>
              <h3>Add Feeding Record</h3>
            </Link>
            <Link to="/livestock/egg" className="action-card">
              <i className="fas fa-egg"></i>
              <h3>Add Egg Record</h3>
            </Link>
            <Link to="/livestock/milk" className="action-card">
              <i className="fas fa-glass-milk"></i>
              <h3>Add Milk Record</h3>
            </Link>
            <Link to="/livestock/death" className="action-card">
              <i className="fas fa-heart-broken"></i>
              <h3>Add Death Record</h3>
            </Link>
            <Link to="/livestock/harvest-sale" className="action-card">
              <i className="fas fa-dollar-sign"></i>
              <h3>Add Sale Record</h3>
            </Link>
            <Link to="/medical" className="action-card">
              <i className="fas fa-notes-medical"></i>
              <h3>Add Medical Record</h3>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage; 