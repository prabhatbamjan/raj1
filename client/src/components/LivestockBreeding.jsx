import React, { useState, useEffect } from "react";
import api from "../utils/api"
import "./LivestockBreeding.css"; // Import the CSS file

const API_URL = "http://localhost:5000/api/breeding";

const LivestockBreeding = () => {
  const [breedingData, setBreedingData] = useState({
    parentBatch: "",
    breedType: "",
    breedingDate: "",
    expectedOffspring: "",
    notes: "",
  });

  const [breedingRecords, setBreedingRecords] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [filterBreedType, setFilterBreedType] = useState(""); // State for filter option

  // Fetch breeding records when component loads
  useEffect(() => {
    fetchBreedingRecords();
  }, []);

  const fetchBreedingRecords = async () => {
    try {
      const response = await api.get(API_URL);
      setBreedingRecords(response.data);
    } catch (error) {
      console.error("Error fetching breeding records:", error);
    }
  };

  const handleChange = (e) => {
    setBreedingData({ ...breedingData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editIndex !== null) {
      // Update existing record
      try {
        const updatedRecord = await api.put(
          `${API_URL}/${breedingRecords[editIndex]._id}`,
          breedingData
        );
        const updatedList = [...breedingRecords];
        updatedList[editIndex] = updatedRecord.data;
        setBreedingRecords(updatedList);
        setEditIndex(null);
      } catch (error) {
        console.error("Error updating breeding record:", error);
      }
    } else {
      // Add new record
      try {
        const newRecord = await api.post(`${API_URL}/add`, breedingData);
        setBreedingRecords([...breedingRecords, newRecord.data]);
      } catch (error) {
        console.error("Error saving breeding record:", error);
      }
    }

    // Reset form data
    setBreedingData({
      parentBatch: "",
      breedType: "",
      breedingDate: "",
      expectedOffspring: "",
      notes: "",
    });
    setShowForm(false); // Hide the form after submission
  };

  const handleEdit = (index) => {
    setBreedingData(breedingRecords[index]);
    setEditIndex(index);
    setShowForm(true); // Show the form when editing
  };

  const handleDelete = async (index) => {
    try {
      await api.delete(`${API_URL}/${breedingRecords[index]._id}`);
      setBreedingRecords(breedingRecords.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const handleCancel = () => {
    // Reset the form data and hide the form
    setBreedingData({
      parentBatch: "",
      breedType: "",
      breedingDate: "",
      expectedOffspring: "",
      notes: "",
    });
    setShowForm(false); // Hide the form when cancel is clicked
  };

  // Filter records based on search term and breed type filter
  const filteredRecords = breedingRecords.filter((record) => {
    const matchesSearchTerm =
      record.parentBatch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.breedType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBreedType ? record.breedType === filterBreedType : true;
    return matchesSearchTerm && matchesFilter;
  });

  return (
    <div className="container">
      {/* Add Record Button */}
      <button
        className="add-btn"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Hide Form" : "Add Record"}
      </button>

      {/* Search and Filter Section */}
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search by Parent Batch or Breed Type"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterBreedType}
          onChange={(e) => setFilterBreedType(e.target.value)}
          className="filter-select"
        >
          <option value="">Filter by Breed Type</option>
          {/* Add options dynamically if necessary */}
          <option value="BreedType1">BreedType1</option>
          <option value="BreedType2">BreedType2</option>
          {/* Add more options based on your available data */}
        </select>
      </div>

      {/* Form Section (Hover Above Records List) */}
      <div className={`form-overlay ${showForm ? "show" : ""}`}>
        <div className="form-section">
          <h3 className="form-title">{editIndex !== null ? "Edit Breeding Record" : "Add Breeding Record"}</h3>
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px" }}>
            <input
              type="text"
              name="parentBatch"
              value={breedingData.parentBatch}
              onChange={handleChange}
              placeholder="Parent Batch"
              required
              className="form-input"
            />
            <input
              type="text"
              name="breedType"
              value={breedingData.breedType}
              onChange={handleChange}
              placeholder="Breed Type"
              required
              className="form-input"
            />
            <input
              type="date"
              name="breedingDate"
              value={breedingData.breedingDate}
              onChange={handleChange}
              required
              className="form-input"
            />
            <input
              type="number"
              name="expectedOffspring"
              value={breedingData.expectedOffspring}
              onChange={handleChange}
              placeholder="Expected Offspring"
              required
              className="form-input"
            />
            <textarea
              name="notes"
              value={breedingData.notes}
              onChange={handleChange}
              placeholder="Notes"
              className="form-input"
              style={{ resize: "none", height: "80px" }}
            />
            <div className="form-actions">
              <button type="submit" className="button">
                {editIndex !== null ? "Update Record" : "Add Record"}
              </button>
              <button type="button" className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Breeding Records List Section */}
      <div className="list-section">
        <h3 className="list-title">Breeding Records</h3>
        {filteredRecords.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Parent Batch</th>
                <th className="table-header">Breed Type</th>
                <th className="table-header">Breeding Date</th>
                <th className="table-header">Offspring</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, index) => (
                <tr key={record._id || index} className="table-row">
                  <td className="table-cell">{record.parentBatch}</td>
                  <td className="table-cell">{record.breedType}</td>
                  <td className="table-cell">{record.breedingDate}</td>
                  <td className="table-cell">{record.expectedOffspring}</td>
                  <td className="table-cell">
                    <button onClick={() => handleEdit(index)} className="action-btn">Edit</button>
                    <button onClick={() => handleDelete(index)} className="action-btn delete-btn">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: "center", color: "#888" }}>No breeding records available</p>
        )}
      </div>
    </div>
  );
};

export default LivestockBreeding;
