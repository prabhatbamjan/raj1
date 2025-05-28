import React, { useState, useEffect } from "react";
import api from "../utils/api"; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const API_URL = "http://localhost:5000/api/livestock-medical";

const LivestockMedicalRecords = () => {
  const [formData, setFormData] = useState({
    recordType: "",
    parentBatch: "",
    diseaseType: "",
    dosage: "",
    medication: "",
    recordDate: "",
    notes: "",
  });

  const [medicalRecords, setMedicalRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [formPosition, setFormPosition] = useState({ top: 70, right: 20 });

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  useEffect(() => {
    // Filter records based on search term and filter type
    let results = medicalRecords;
    
    if (searchTerm) {
      results = results.filter(record => 
        record.parentBatch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.diseaseType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.medication.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== "all") {
      results = results.filter(record => record.recordType === filterType);
    }
    
    setFilteredRecords(results);
  }, [searchTerm, filterType, medicalRecords]);

  const fetchMedicalRecords = async () => {
    try {
      const response = await api.get(API_URL);
      setMedicalRecords(response.data);
      setFilteredRecords(response.data);
    } catch (error) {
      console.error("Error fetching medical records:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editIndex !== null) {
      try {
        const updatedRecord = await api.put(
          `${API_URL}/${medicalRecords[editIndex]._id}`,
          formData
        );
        const updatedRecords = [...medicalRecords];
        updatedRecords[editIndex] = updatedRecord.data;
        setMedicalRecords(updatedRecords);
        setEditIndex(null);
      } catch (error) {
        console.error("Error updating record:", error);
      }
    } else {
      try {
        const newRecord = await api.post(`${API_URL}/add`, formData);
        setMedicalRecords([...medicalRecords, newRecord.data]);
      } catch (error) {
        console.error("Error adding record:", error);
      }
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      recordType: "",
      parentBatch: "",
      diseaseType: "",
      dosage: "",
      medication: "",
      recordDate: "",
      notes: "",
    });
    setShowForm(false);
    setEditIndex(null);
  };

  const handleEdit = (index) => {
    const recordIndex = medicalRecords.findIndex(record => record._id === filteredRecords[index]._id);
    setFormData(medicalRecords[recordIndex]);
    setEditIndex(recordIndex);
    setShowForm(true);
  };

  const handleDelete = async (index) => {
    try {
      const recordIndex = medicalRecords.findIndex(record => record._id === filteredRecords[index]._id);
      await api.delete(`${API_URL}/${medicalRecords[recordIndex]._id}`);
      setMedicalRecords(medicalRecords.filter((_, i) => i !== recordIndex));
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };

  // Handle form drag functionality
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.target.classList.contains('form-header')) {
      setIsDragging(true);
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const container = document.querySelector('.container');
    const containerRect = container.getBoundingClientRect();
    
    // Calculate new position relative to container
    const newLeft = e.clientX - containerRect.left - dragOffset.x;
    const newTop = e.clientY - containerRect.top - dragOffset.y;
    
    // Set boundaries to keep form within container
    const formWidth = 320; // Approximate form width
    const formHeight = 440; // Approximate form height
    
    const maxLeft = containerRect.width - formWidth;
    const maxTop = containerRect.height - formHeight;
    
    setFormPosition({
      left: Math.max(0, Math.min(newLeft, maxLeft)),
      top: Math.max(0, Math.min(newTop, maxTop)),
      right: 'auto' // Clear right when positioning with left
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Analytics Data Preparation
  const prepareAnalyticsData = () => {
    // Record type distribution
    const recordTypeData = [
      { name: 'Vaccination', value: medicalRecords.filter(r => r.recordType === 'Vaccination').length },
      { name: 'Treatment', value: medicalRecords.filter(r => r.recordType === 'Treatment').length },
      { name: 'Checkup', value: medicalRecords.filter(r => r.recordType === 'Checkup').length },
      { name: 'Preventive', value: medicalRecords.filter(r => r.recordType === 'Preventive').length }
    ].filter(item => item.value > 0);

    // Disease frequency data
    const diseaseFrequency = {};
    medicalRecords.forEach(record => {
      if (record.diseaseType) {
        diseaseFrequency[record.diseaseType] = (diseaseFrequency[record.diseaseType] || 0) + 1;
      }
    });
    
    const diseaseData = Object.keys(diseaseFrequency).map(disease => ({
      name: disease,
      count: diseaseFrequency[disease]
    })).sort((a, b) => b.count - a.count).slice(0, 5); // Top 5 diseases

    // Monthly distribution
    const monthlyData = {};
    medicalRecords.forEach(record => {
      if (record.recordDate) {
        const month = new Date(record.recordDate).toLocaleString('default', { month: 'short' });
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      }
    });
    
    const monthlyChartData = Object.keys(monthlyData).map(month => ({
      month,
      count: monthlyData[month]
    }));

    return { recordTypeData, diseaseData, monthlyChartData };
  };

  const { recordTypeData, diseaseData, monthlyChartData } = prepareAnalyticsData();
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Form style with position based on state
  const formStyle = {
    position: 'absolute',
    zIndex: 1000,
    width: '320px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    padding: showForm ? '15px' : '0',
    height: showForm ? 'auto' : '0',
    opacity: showForm ? 1 : 0,
    pointerEvents: showForm ? 'auto' : 'none',
    transition: 'opacity 0.3s, height 0.3s, padding 0.3s',
    overflowY: 'auto',
    maxHeight: '80vh',
    ...formPosition
  };

  return (
    <div className="container" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Top Action Buttons */}
      <div className="top-actions" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          className="button"
          onClick={() => setShowAnalytics(!showAnalytics)}
          style={{ backgroundColor: showAnalytics ? '#6c757d' : '#28a745' }}
        >
          {showAnalytics ? 'Show Records' : 'Show Analytics'}
        </button>
        
        <button
          className="add-btn"
          onClick={() => {
            if (editIndex !== null) {
              resetForm();
            } else {
              setShowForm(!showForm);
              // Reset form position to default when opening
              if (!showForm) {
                setFormPosition({ top: 70, right: 20, left: 'auto' });
              }
            }
          }}
        >
          {showForm ? (editIndex !== null ? 'Cancel Edit' : 'Hide Form') : 'Add Record'}
        </button>
      </div>

      {/* Draggable Form */}
      <div 
        style={formStyle}
        onMouseDown={handleMouseDown}
      >
        <div className="form-header" style={{ 
          cursor: 'move', 
          padding: '10px 0', 
          marginBottom: '10px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 className="form-title" style={{ margin: 0 }}>
            {editIndex !== null ? "Edit Medical Record" : "Add Medical Record"}
          </h3>
          <button 
            onClick={resetForm} 
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#6c757d'
            }}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px" }}>
          <select
            name="recordType"
            value={formData.recordType}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">Select Record Type</option>
            <option value="Vaccination">Vaccination</option>
            <option value="Treatment">Treatment</option>
            <option value="Checkup">Checkup</option>
            <option value="Preventive">Preventive Care</option>
          </select>
          <input
            type="text"
            name="parentBatch"
            value={formData.parentBatch}
            onChange={handleChange}
            placeholder="Parent Batch"
            required
            className="input"
          />
          <input
            type="text"
            name="diseaseType"
            value={formData.diseaseType}
            onChange={handleChange}
            placeholder="Disease Type"
            className="input"
          />
          <input
            type="text"
            name="dosage"
            value={formData.dosage}
            onChange={handleChange}
            placeholder="Dosage"
            className="input"
          />
          <input
            type="text"
            name="medication"
            value={formData.medication}
            onChange={handleChange}
            placeholder="Medication"
            className="input"
          />
          <input
            type="date"
            name="recordDate"
            value={formData.recordDate}
            onChange={handleChange}
            required
            className="input"
          />
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Notes"
            className="input"
            style={{ resize: "none", height: "80px" }}
          ></textarea>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="button" style={{ flex: 1 }}>
              {editIndex !== null ? "Update Record" : "Add Record"}
            </button>
            {editIndex !== null && (
              <button 
                type="button" 
                className="cancel-button" 
                onClick={resetForm}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {showAnalytics ? (
        /* Analytics Dashboard */
        <div className="list-section">
          <h3 className="list-title">Medical Records Analytics</h3>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
            {/* Summary Cards */}
            <div style={{ flex: '1 1 200px', backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <h4 style={{ color: '#28a745', marginTop: 0 }}>Total Records</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>{medicalRecords.length}</p>
            </div>
            
            <div style={{ flex: '1 1 200px', backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <h4 style={{ color: '#007bff', marginTop: 0 }}>Vaccinations</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>
                {medicalRecords.filter(r => r.recordType === 'Vaccination').length}
              </p>
            </div>
            
            <div style={{ flex: '1 1 200px', backgroundColor: '#fff3cd', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <h4 style={{ color: '#ffc107', marginTop: 0 }}>Treatments</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>
                {medicalRecords.filter(r => r.recordType === 'Treatment').length}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            {/* Record Type Distribution */}
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <h4 style={{ marginTop: 0 }}>Record Type Distribution</h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={recordTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {recordTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Disease Frequency */}
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <h4 style={{ marginTop: 0 }}>Top 5 Diseases</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={diseaseData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Monthly Distribution */}
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              <h4 style={{ marginTop: 0 }}>Monthly Distribution</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#28a745" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        /* Medical Records List Section */
        <div className="list-section">
          <h3 className="list-title">Medical Records</h3>
          
          {/* Search and Filter */}
          <div className="search-filter-section">
            <div>
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
            <div>
              <span className="filter-label">Filter by Type:</span>
              <select 
                value={filterType} 
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="all">All Records</option>
                <option value="Vaccination">Vaccination</option>
                <option value="Treatment">Treatment</option>
                <option value="Checkup">Checkup</option>
                <option value="Preventive">Preventive Care</option>
              </select>
            </div>
          </div>
          
          {filteredRecords.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Type</th>
                    <th className="table-header">Batch</th>
                    <th className="table-header">Disease</th>
                    <th className="table-header">Medication</th>
                    <th className="table-header">Date</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record, index) => (
                    <tr key={record._id} className="table-row">
                      <td className="table-cell">{record.recordType}</td>
                      <td className="table-cell">{record.parentBatch}</td>
                      <td className="table-cell">{record.diseaseType}</td>
                      <td className="table-cell">{record.medication}</td>
                      <td className="table-cell">{new Date(record.recordDate).toLocaleDateString()}</td>
                      <td className="table-cell">
                        <button
                          onClick={() => handleEdit(index)}
                          className="action-button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="action-button delete-button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ 
              textAlign: "center", 
              padding: "30px", 
              backgroundColor: "#f9f9f9", 
              borderRadius: "10px", 
              marginTop: "20px" 
            }}>
              <p style={{ color: "#6c757d", fontSize: "16px" }}>
                {searchTerm || filterType !== "all" 
                  ? "No records match your search criteria" 
                  : "No medical records available"}
              </p>
              <button 
                onClick={() => { setShowForm(true); setSearchTerm(""); setFilterType("all"); }}
                className="button"
                style={{ marginTop: "15px" }}
              >
                Add Your First Record
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LivestockMedicalRecords;