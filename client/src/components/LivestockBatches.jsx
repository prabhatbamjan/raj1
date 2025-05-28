import React, { useState, useEffect } from "react";
import api from "../utils/api";
import "./LivestockBatches.css";
import { useNavigate } from 'react-router-dom';

const LivestockBatches = () => {
  const [formData, setFormData] = useState({
    batchName: "",
    selectAnimal: "",
    raisedFor: "",
    startDate: "",
  });

  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    filterBatches();
  }, [searchTerm, batches]);

  const fetchBatches = async () => {
    try {
      const response = await api.get('/batches');
      setBatches(response.data);
      setFilteredBatches(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching batches:', err);
      setError(err.response?.data?.message || 'Failed to fetch batches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterBatches = () => {
    let filteredBatches = batches;

    if (searchTerm) {
      filteredBatches = filteredBatches.filter((batch) =>
        batch.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.selectAnimal.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBatches(filteredBatches);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.batchName || !formData.selectAnimal || !formData.raisedFor || !formData.startDate) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      if (editIndex !== null) {
        const updatedBatch = await api.put(`/batches/${batches[editIndex]._id}`, formData);
        const updatedBatches = [...batches];
        updatedBatches[editIndex] = updatedBatch.data;
        setBatches(updatedBatches);
        setEditIndex(null);
      } else {
        const newBatch = await api.post('/batches/add', formData);
        setBatches([...batches, newBatch.data]);
      }
      setFormData({ batchName: "", selectAnimal: "", raisedFor: "", startDate: "" });
      setShowForm(false);
      setError("");
    } catch (error) {
      console.error("Error saving batch:", error);
      setError("Failed to save batch. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index) => {
    const batch = batches[index];
    setFormData(batch);
    setEditIndex(index);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/batches/${id}`);
      setBatches(batches.filter((batch) => batch._id !== id));
    } catch (error) {
      console.error("Error deleting batch:", error);
      setError("Failed to delete batch. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading batches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => fetchBatches()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <button className="add-btn" onClick={() => setShowForm(true)}>Add New Batch</button>
      
      <div className="list-section">
        <h2 className="list-title">Batch List</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by batch name or animal type"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {filteredBatches.length === 0 && !loading && !error ? (
          <p>No batches found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBatches.map((batch) => (
              <div key={batch._id} className="border rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-bold mb-2">{batch.batchName}</h3>
                <p><strong>Animal Type:</strong> {batch.selectAnimal}</p>
                <p><strong>Quantity:</strong> {batch.quantity}</p>
                <p><strong>Start Date:</strong> {new Date(batch.startDate).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="form-overlay show">
          <div className="form-section">
            <h3 className="form-title">{editIndex !== null ? "Edit Batch" : "Add New Batch"}</h3>
            <form onSubmit={handleSubmit}>
              {error && <p style={{ color: "red" }}>{error}</p>}
              <input
                type="text"
                name="batchName"
                placeholder="Batch Name"
                value={formData.batchName}
                onChange={handleChange}
                className="form-input"
              />
              <input
                type="text"
                name="selectAnimal"
                placeholder="Animal"
                value={formData.selectAnimal}
                onChange={handleChange}
                className="form-input"
              />
              <input
                type="text"
                name="raisedFor"
                placeholder="Raised For"
                value={formData.raisedFor}
                onChange={handleChange}
                className="form-input"
              />
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="form-input"
              />
              <div className="form-actions">
                <button type="submit" className="button">{editIndex !== null ? "Update" : "Add"} Batch</button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivestockBatches;
