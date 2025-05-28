import React, { useState, useEffect } from "react";
import api from "../utils/api";
import "./HarvestingRecordsForm.css";


const API_URL = "http://localhost:5000/api/harvesting";

const HarvestingRecordsForm = () => {
  const [formData, setFormData] = useState({
    cropType: "",
    harvestedDate: "",
    quantity: "",
    notes: "",
  });

  const [harvestingRecords, setHarvestingRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Fetch records on mount
  useEffect(() => {
    const fetchHarvestingRecords = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setHarvestingRecords(response.data);
      } catch (error) {
        console.error("Error fetching harvesting records:", error);
      }
    };
    fetchHarvestingRecords();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`${API_URL}/${editingId}`, formData);
        setHarvestingRecords((prev) =>
          prev.map((record) =>
            record._id === editingId ? { ...record, ...formData } : record
          )
        );
        setEditingId(null);
      } else {
        const response = await api.post(API_URL, formData);
        setHarvestingRecords((prev) => [...prev, response.data]);
      }

      // Reset form
      setFormData({
        cropType: "",
        harvestedDate: "",
        quantity: "",
        notes: "",
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error saving harvesting record:", error);
    }
  };

  // Handle record edit
  const handleEdit = (id) => {
    const record = harvestingRecords.find((rec) => rec._id === id);
    if (record) {
      setFormData({
        cropType: record.cropType,
        harvestedDate: record.harvestedDate,
        quantity: record.quantity,
        notes: record.notes,
      });
      setEditingId(id);
      setShowForm(true);
    }
  };

  // Handle record delete
  const handleDelete = async (id) => {
    try {
      await api.delete(`${API_URL}/${id}`);
      setHarvestingRecords((prev) => prev.filter((rec) => rec._id !== id));
    } catch (error) {
      console.error("Error deleting harvesting record:", error);
    }
  };

  // Filter records by query and date
  const filteredRecords = harvestingRecords.filter((record) =>
    (record.cropType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.notes.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!filterDate || record.harvestedDate === filterDate)
  );

  return (
    <div className="container">
      <button className="addButton" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Hide Form" : "Add Harvesting Record"}
      </button>

      {showForm && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h3>{editingId ? "Edit Harvesting Record" : "Add Harvesting Record"}</h3>
            <form onSubmit={handleSubmit}>
              <label>Crop Type</label>
              <input
                type="text"
                name="cropType"
                value={formData.cropType}
                onChange={handleChange}
                required
              />

              <label>Harvested Date</label>
              <input
                type="date"
                name="harvestedDate"
                value={formData.harvestedDate}
                onChange={handleChange}
                required
              />

              <label>Quantity (kg)</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
              />

              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              ></textarea>

              <div className="modalButtons">
                <button type="submit">{editingId ? "Update" : "Add"}</button>
                <button
                  className="cancelButton"
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      cropType: "",
                      harvestedDate: "",
                      quantity: "",
                      notes: "",
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="listSection">
        <h2 className="listTitle">Harvesting Records List</h2>

        <div className="searchFilter">
          <input
            type="text"
            placeholder="Search by crop type or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Crop Type</th>
              <th>Harvested Date</th>
              <th>Quantity (kg)</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr key={record._id}>
                <td>{record.cropType}</td>
                <td>{record.harvestedDate}</td>
                <td>{record.quantity}</td>
                <td>{record.notes}</td>
                <td>
                  <button onClick={() => handleEdit(record._id)}>Edit</button>
                  <button
                    className="deleteButton"
                    onClick={() => handleDelete(record._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "gray" }}>
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HarvestingRecordsForm;
