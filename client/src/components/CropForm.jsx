import React, { useState, useEffect } from "react";
import api from "../utils/api";
import "./FarmCropStyles.css"; // Import the CSS file


const API_URL = "http://localhost:5000/api/crops";

const getCrops = async () => {
  try {
    const response = await api.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching crops:", error);
    return [];
  }
};

const addCrop = async (crop) => {
  try {
    const response = await api.post(`${API_URL}/add`, crop);
    return response.data;
  } catch (error) {
    console.error("Error adding crop:", error);
  }
};

const updateCrop = async (id, updatedCrop) => {
  try {
    await api.put(`${API_URL}/${id}`, updatedCrop);
  } catch (error) {
    console.error("Error updating crop:", error);
  }
};

const deleteCrop = async (id) => {
  try {
    await api.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error("Error deleting crop:", error);
  }
};

const formatDate = (dateString) => {
  return dateString ? new Date(dateString).toISOString().split("T")[0] : "";
};

const CropForm = () => {
  const [formData, setFormData] = useState({
    cropType: "",
    scientificName: "",
    planted: "",
    expectedHarvest: "",
    location: "",
  });

  const [crops, setCrops] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCrop, setEditingCrop] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);

  useEffect(() => {
    const fetchCrops = async () => {
      setIsLoading(true);
      const data = await getCrops();
      setCrops(data);
      setIsLoading(false);
    };
    fetchCrops();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (editingCrop) {
      await updateCrop(editingCrop._id, formData);
      setCrops(crops.map((crop) => (crop._id === editingCrop._id ? { ...formData, _id: editingCrop._id } : crop)));
      setEditingCrop(null);
    } else {
      const newCrop = await addCrop(formData);
      if (newCrop) setCrops([...crops, newCrop]);
    }
    
    setFormData({
      cropType: "",
      scientificName: "",
      planted: "",
      expectedHarvest: "",
      location: "",
    });
    setShowForm(false);
    setIsLoading(false);
  };

  const handleEdit = (crop) => {
    setEditingCrop(crop);
    setFormData({
      ...crop,
      planted: formatDate(crop.planted),
      expectedHarvest: formatDate(crop.expectedHarvest),
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    await deleteCrop(id);
    setCrops(crops.filter((crop) => crop._id !== id));
    setShowConfirmDelete(null);
    setIsLoading(false);
  };

  const handleCancelEdit = () => {
    setEditingCrop(null);
    setFormData({
      cropType: "",
      scientificName: "",
      planted: "",
      expectedHarvest: "",
      location: "",
    });
    setShowForm(false);
  };

  const filteredCrops = crops.filter((crop) => {
    const matchesSearch =
      crop.cropType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.scientificName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = !filterDate || formatDate(crop.planted) === filterDate;

    return matchesSearch && matchesDate;
  });

  const calculateDaysUntilHarvest = (harvestDate) => {
    if (!harvestDate) return null;
    
    const today = new Date();
    const harvest = new Date(harvestDate);
    const diffTime = harvest - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  const getHarvestStatusColor = (harvestDate) => {
    if (!harvestDate) return "#999";
    
    const daysUntilHarvest = calculateDaysUntilHarvest(harvestDate);
    
    if (daysUntilHarvest === 0) return "#28a745"; // Ready to harvest
    if (daysUntilHarvest <= 7) return "#ffc107"; // Approaching harvest
    return "#17a2b8"; // Still growing
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div>
          <h1 className="title">Farm Crop Management</h1>
          <p className="subtitle">Track and manage your farming operations</p>
        </div>
        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          Add New Crop
        </button>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="search-container">
          <label className="label"></label>
          <div style={{ position: "relative" }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        <div className="date-container">
          <label className="label"></label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="input"
          />
        </div>
        {(searchQuery || filterDate) && (
          <button
            onClick={() => {
              setSearchQuery("");
              setFilterDate("");
            }}
            className="clear-filter"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header">Crop Type</th>
              <th className="table-header">Scientific Name</th>
              <th className="table-header">Planted Date</th>
              <th className="table-header">Harvest Status</th>
              <th className="table-header">Location</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCrops.length > 0 ? (
              filteredCrops.map((crop) => {
                const daysUntilHarvest = calculateDaysUntilHarvest(crop.expectedHarvest);
                const harvestStatusColor = getHarvestStatusColor(crop.expectedHarvest);
                
                let harvestStatus = "Not Set";
                if (crop.expectedHarvest) {
                  harvestStatus = daysUntilHarvest === 0 
                    ? "Ready to Harvest" 
                    : `${daysUntilHarvest} days left`;
                }
                
                return (
                  <tr
                    key={crop._id}
                    className="table-row"
                  >
                    <td className="table-cell">{crop.cropType}</td>
                    <td className="table-cell scientific-name responsive-text">
                      {crop.scientificName}
                    </td>
                    <td className="table-cell">{formatDate(crop.planted)}</td>
                    <td className="table-cell">
                      <span
                        className="harvest-status"
                        style={{ backgroundColor: harvestStatusColor }}
                      >
                        {harvestStatus}
                      </span>
                    </td>
                    <td className="table-cell responsive-text">{crop.location}</td>
                    <td className="table-cell">
                      <div className="action-container">
                        <button
                          onClick={() => handleEdit(crop)}
                          className="action-button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setShowConfirmDelete(crop._id)}
                          className="action-button delete-button"
                        >
                          Delete
                        </button>
                        
                        {showConfirmDelete === crop._id && (
                          <div className="delete-confirm">
                            <p>Are you sure you want to delete this crop?</p>
                            <div className="delete-confirm-buttons">
                              <button
                                onClick={() => setShowConfirmDelete(null)}
                                className="cancel-button"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleDelete(crop._id)}
                                className="primary-button"
                                style={{ backgroundColor: "#d32f2f" }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">
                  <div className="empty-state-text">
                    {searchQuery || filterDate
                      ? "No crops match your search criteria"
                      : "No crops added yet. Click 'Add New Crop' to get started!"}
                  </div>
                  {searchQuery || filterDate ? (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setFilterDate("");
                      }}
                      className="primary-button"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowForm(true)}
                      className="primary-button"
                    >
                      Add First Crop
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Crop Form Modal */}
      <div className={`form-overlay ${showForm ? 'show' : ''}`} onClick={handleCancelEdit}>
        <div className="form-container" onClick={(e) => e.stopPropagation()}>
          <div className="form-title">
            <span>{editingCrop ? "Edit Crop" : "Add New Crop"}</span>
            <button
              onClick={handleCancelEdit}
              className="close-button"
              aria-label="Close form"
            >
              ×
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label" htmlFor="cropType">
                Crop Type <span className="required-field">*</span>
              </label>
              <input
                id="cropType"
                type="text"
                name="cropType"
                placeholder="e.g., Tomato"
                value={formData.cropType}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
            
            <div className="form-group">
              <label className="label" htmlFor="scientificName">
                Scientific Name <span className="required-field">*</span>
              </label>
              <input
                id="scientificName"
                type="text"
                name="scientificName"
                placeholder="e.g., Solanum lycopersicum"
                value={formData.scientificName}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
            
            {/* Date fields in a row */}
            <div className="form-row">
              <div className="form-column">
                <label className="label" htmlFor="planted">
                  Planted Date
                </label>
                <input
                  id="planted"
                  type="date"
                  name="planted"
                  value={formData.planted}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              <div className="form-column">
                <label className="label" htmlFor="expectedHarvest">
                  Expected Harvest Date
                </label>
                <input
                  id="expectedHarvest"
                  type="date"
                  name="expectedHarvest"
                  value={formData.expectedHarvest}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="label" htmlFor="location">
                Location <span className="required-field">*</span>
              </label>
              <input
                id="location"
                type="text"
                name="location"
                placeholder="e.g., Field A, North Section"
                value={formData.location}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
            
            <div className="button-row">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="cancel-button"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-button"
              >
                {editingCrop ? "Update Crop" : "Add Crop"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Loading Spinner */}
      <div className={`loading-overlay ${isLoading ? 'show' : ''}`}>
        <div className="spinner"></div>
      </div>
    </div>
  );
};

export default CropForm;