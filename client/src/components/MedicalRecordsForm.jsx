import React, { useState, useEffect } from "react";
import api from "../utils/api";
import "./MedicalRecordsForm.css"; // Import the CSS file

const API_URL = "http://localhost:5000/api/medical-records";

const MedicalRecordsForm = () => {
  const [formData, setFormData] = useState({
    cropType: "",
    date: "",
    symptoms: "",
    diagnosis: "",
    treatment: "",
    notes: "",
  });

  const [medicalRecords, setMedicalRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMedicalRecords(response.data);
      } catch (error) {
        console.error("Error fetching medical records:", error);
      }
    };
    fetchMedicalRecords();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      try {
        await api.put(`${API_URL}/${editingId}`, formData);
        setMedicalRecords((prevRecords) =>
          prevRecords.map((record) =>
            record._id === editingId ? { ...record, ...formData } : record
          )
        );
        setEditingId(null);
      } catch (error) {
        console.error("Error updating medical record:", error);
      }
    } else {
      try {
        const response = await api.post(API_URL, formData);
        setMedicalRecords([...medicalRecords, response.data]);
      } catch (error) {
        console.error("Error adding medical record:", error);
      }
    }
    setFormData({
      cropType: "",
      date: "",
      symptoms: "",
      diagnosis: "",
      treatment: "",
      notes: "",
    });
    setShowForm(false); // Hide the form after submission
  };

  const handleEdit = (id) => {
    const recordToEdit = medicalRecords.find((record) => record._id === id);
    setFormData(recordToEdit);
    setEditingId(id);
    setShowForm(true); // Show the form when editing
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`${API_URL}/${id}`);
      setMedicalRecords(medicalRecords.filter((record) => record._id !== id));
    } catch (error) {
      console.error("Error deleting medical record:", error);
    }
  };

  const filteredRecords = medicalRecords.filter(
    (record) =>
      (record.cropType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.symptoms.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!filterDate || record.date === filterDate)
  );

  return (
    <div className="container">
      {/* Add Medical Record Button */}
      <button className="addButton" onClick={() => setShowForm(true)}>
        Add Medical Record
      </button>

      {/* Form Modal */}
      {showForm && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h3 className="formTitle">{editingId ? "Edit Medical Record" : "Add Medical Record"}</h3>
            <form onSubmit={handleSubmit}>
              {["cropType", "symptoms", "diagnosis", "treatment"].map((field) => (
                <div key={field}>
                  <label>{field}</label>
                  <input type="text" name={field} value={formData[field]} onChange={handleChange} required />
                </div>
              ))}
              <div>
                <label>Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required />
              </div>
              <div>
                <label>Notes</label>
                <input type="text" name="notes" value={formData.notes} onChange={handleChange} />
              </div>
              <div className="modalButtons">
                <button type="submit">{editingId ? "Update" : "Add"}</button>
                <button type="button" className="cancelButton" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medical Records Table */}
      <div className="listSection">
        <h2 className="listTitle">Medical Records List</h2>

        {/* Search & Filter */}
        <div className="searchFilter">
          <input
            type="text"
            placeholder="Search by crop type or symptoms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <input
            type="date"
            placeholder="Filter by date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        <table className="table">
          <thead>
            <tr>
              {["Crop Type", "Date", "Symptoms", "Diagnosis", "Treatment", "Notes", "Actions"].map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr key={record._id}>
                {["cropType", "date", "symptoms", "diagnosis", "treatment", "notes"].map((field) => (
                  <td key={field}>{record[field]}</td>
                ))}
                <td>
                  <button onClick={() => handleEdit(record._id)}>Edit</button>
                  <button onClick={() => handleDelete(record._id)} className="deleteButton">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicalRecordsForm;
