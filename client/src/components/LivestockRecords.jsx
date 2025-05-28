import React, { useState, useEffect } from "react";
import api from "../utils/api"; // Fixed import path
import "./LivestockRecords.css"; // Using our updated CSS

const LivestockRecords = () => {
  const [selectedRecord, setSelectedRecord] = useState("feeding");
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({
    date: "",
    livestockType: "",
    feedType: "",
    quantity: "",
    quality: "",
    cause: "",
    price: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: { start: "", end: "" },
    livestockType: "",
    quality: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch records using the configured api instance
  const fetchRecords = async () => {
    try {
      // Assuming /api/livestock/records exists and returns records
      const response = await api.get('/livestock'); 
      setRecords(response.data);
      setFilteredRecords(response.data);
      calculateStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching records:', err);
      setError(err.response?.data?.message || 'Failed to fetch records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // Reset filters when changing record type
    setFilters({
      dateRange: { start: "", end: "" },
      livestockType: "",
      quality: "",
    });
    setSearchQuery("");
  }, []); // Empty dependency array means this runs once on mount

  // Calculate statistics
  const calculateStats = (recordsData) => {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    
    const todayRecords = recordsData.filter(record => 
      record.date.split('T')[0] === today
    ).length;
    
    const monthRecords = recordsData.filter(record => 
      record.date.substring(0, 7) === thisMonth
    ).length;
    
    setStats({
      total: recordsData.length,
      today: todayRecords,
      thisMonth: monthRecords
    });
  };

  // Add validation function
  const validateForm = () => {
    const errors = {};
    if (!formData.date) errors.date = "Date is required";
    if (!formData.livestockType) errors.livestockType = "Livestock type is required";
    if (!formData.quantity && ["feeding", "egg", "milk", "harvest-sale"].includes(selectedRecord)) 
      errors.quantity = "Quantity is required";
    if (selectedRecord === "feeding" && !formData.feedType) errors.feedType = "Feed type is required";
    if ((selectedRecord === "egg" || selectedRecord === "milk") && !formData.quality) 
      errors.quality = "Quality is required";
    if (selectedRecord === "death" && !formData.cause) errors.cause = "Cause is required";
    if (selectedRecord === "harvest-sale" && !formData.price) errors.price = "Price is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Update handleSubmit to include validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingId) {
        await api.put(`/livestock/${selectedRecord}/${editingId}`, formData);
      } else {
        await api.post(`/livestock/${selectedRecord}`, formData);
      }
      fetchRecords();
      setFormData({
        date: "",
        livestockType: "",
        feedType: "",
        quantity: "",
        quality: "",
        cause: "",
        price: "",
      });
      setEditingId(null);
      setIsFormVisible(false);
      setFormErrors({});
    } catch (error) {
      console.error("Error saving record:", error);
    }
  };

  // Handle search and filters
  const handleSearchAndFilter = () => {
    let filtered = [...records];

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter((record) =>
        Object.values(record).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply date range filter
    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter((record) => {
        const recordDate = new Date(record.date);
        return (
          recordDate >= new Date(filters.dateRange.start) &&
          recordDate <= new Date(filters.dateRange.end)
        );
      });
    }

    // Apply livestock type filter
    if (filters.livestockType) {
      filtered = filtered.filter((record) => record.livestockType === filters.livestockType);
    }

    // Apply quality filter
    if (filters.quality) {
      filtered = filtered.filter((record) => record.quality === filters.quality);
    }

    setFilteredRecords(filtered);
  };

  useEffect(() => {
    handleSearchAndFilter();
  }, [searchQuery, filters, records]);

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      dateRange: { start: "", end: "" },
      livestockType: "",
      quality: "",
    });
    setSearchQuery("");
  };

  // Handle edit
  const handleEdit = (record) => {
    setFormData({
      date: record.date.split('T')[0], // Ensure date is in YYYY-MM-DD format
      livestockType: record.livestockType || "",
      feedType: record.feedType || "",
      quantity: record.quantity || "",
      quality: record.quality || "",
      cause: record.cause || "",
      price: record.price || "",
    });
    setEditingId(record._id);
    setIsFormVisible(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await api.delete(`/livestock/${selectedRecord}/${id}`);
        fetchRecords();
      } catch (error) {
        console.error("Error deleting record:", error);
      }
    }
  };

  // Update renderFormFields to include error handling
  const renderFormFields = () => {
    const commonFields = (
      <>
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className={formErrors.date ? "error" : ""}
          />
          {formErrors.date && <span className="error-message">{formErrors.date}</span>}
        </div>
        <div className="form-group">
          <label>Livestock Type</label>
          <select
            value={formData.livestockType}
            onChange={(e) => setFormData({ ...formData, livestockType: e.target.value })}
            className={formErrors.livestockType ? "error" : ""}
          >
            <option value="">Select Type</option>
            <option value="chicken">Chicken</option>
            <option value="cow">Cow</option>
            <option value="sheep">Sheep</option>
            <option value="goat">Goat</option>
            <option value="pig">Pig</option>
          </select>
          {formErrors.livestockType && <span className="error-message">{formErrors.livestockType}</span>}
        </div>
      </>
    );

    switch (selectedRecord) {
      case "feeding":
        return (
          <>
            {commonFields}
            <div className="form-group">
              <label>Feed Type</label>
              <select
                value={formData.feedType}
                onChange={(e) => setFormData({ ...formData, feedType: e.target.value })}
                className={formErrors.feedType ? "error" : ""}
              >
                <option value="">Select Feed Type</option>
                <option value="grain">Grain</option>
                <option value="hay">Hay</option>
                <option value="pellets">Pellets</option>
                <option value="supplements">Supplements</option>
              </select>
              {formErrors.feedType && <span className="error-message">{formErrors.feedType}</span>}
            </div>
            <div className="form-group">
              <label>Quantity (kg)</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className={formErrors.quantity ? "error" : ""}
              />
              {formErrors.quantity && <span className="error-message">{formErrors.quantity}</span>}
            </div>
          </>
        );
      case "egg":
        return (
          <>
            {commonFields}
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className={formErrors.quantity ? "error" : ""}
              />
              {formErrors.quantity && <span className="error-message">{formErrors.quantity}</span>}
            </div>
            <div className="form-group">
              <label>Quality</label>
              <select
                value={formData.quality}
                onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                className={formErrors.quality ? "error" : ""}
              >
                <option value="">Select Quality</option>
                <option value="grade_a">Grade A</option>
                <option value="grade_b">Grade B</option>
                <option value="grade_c">Grade C</option>
              </select>
              {formErrors.quality && <span className="error-message">{formErrors.quality}</span>}
            </div>
          </>
        );
      case "milk":
        return (
          <>
            {commonFields}
            <div className="form-group">
              <label>Quantity (liters)</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className={formErrors.quantity ? "error" : ""}
              />
              {formErrors.quantity && <span className="error-message">{formErrors.quantity}</span>}
            </div>
            <div className="form-group">
              <label>Quality</label>
              <select
                value={formData.quality}
                onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                className={formErrors.quality ? "error" : ""}
              >
                <option value="">Select Quality</option>
                <option value="grade_a">Grade A</option>
                <option value="grade_b">Grade B</option>
                <option value="grade_c">Grade C</option>
              </select>
              {formErrors.quality && <span className="error-message">{formErrors.quality}</span>}
            </div>
          </>
        );
      case "death":
        return (
          <>
            {commonFields}
            <div className="form-group">
              <label>Cause of Death</label>
              <select
                value={formData.cause}
                onChange={(e) => setFormData({ ...formData, cause: e.target.value })}
                className={formErrors.cause ? "error" : ""}
              >
                <option value="">Select Cause</option>
                <option value="disease">Disease</option>
                <option value="accident">Accident</option>
                <option value="old_age">Old Age</option>
                <option value="predator">Predator</option>
                <option value="other">Other</option>
              </select>
              {formErrors.cause && <span className="error-message">{formErrors.cause}</span>}
            </div>
          </>
        );
      case "harvest-sale":
        return (
          <>
            {commonFields}
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className={formErrors.quantity ? "error" : ""}
              />
              {formErrors.quantity && <span className="error-message">{formErrors.quantity}</span>}
            </div>
            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className={formErrors.price ? "error" : ""}
              />
              {formErrors.price && <span className="error-message">{formErrors.price}</span>}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  // Get unique values for filters
  const getUniqueValues = (field) => {
    return [...new Set(records.map((record) => record[field]))].filter(Boolean);
  };

  // Format quality display
  const formatQuality = (quality) => {
    if (!quality) return "";
    return quality.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  // Render quality badge
  const renderQualityBadge = (quality) => {
    if (!quality) return null;
    
    const badgeClass = `badge badge-${quality.toLowerCase()}`;
    return <span className={badgeClass}>{formatQuality(quality)}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading records...</p>
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
            onClick={() => fetchRecords()} // Retry fetching
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (records.length === 0 && !loading && !error) {
    return <p>No records found.</p>;
  }

  return (
    <div className="livestock-container">
      {/* Left: Navigation Menu */}
      <div className="sidebar">
        <h2>Livestock Records</h2>
        <ul>
          {["feeding", "egg", "milk", "death", "harvest-sale"].map((recordType) => (
            <li
              key={recordType}
              onClick={() => setSelectedRecord(recordType)}
              className={selectedRecord === recordType ? "active" : ""}
            >
              <i className={`fas fa-${getRecordIcon(recordType)}`}></i>
              {recordType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </li>
          ))}
        </ul>
      </div>

      {/* Right: Content Display */}
      <div className="content">
        <div className="content-header">
          <h2>{selectedRecord.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Records</h2>
          <button className="add-button" onClick={() => setIsFormVisible(true)}>
            <i className="fas fa-plus"></i> Add Record
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-title">Total Records</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-icon">
              <i className="fas fa-clipboard-list"></i> All Time
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Today's Records</div>
            <div className="stat-value">{stats.today}</div>
            <div className="stat-icon">
              <i className="fas fa-calendar-day"></i> Today
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">This Month</div>
            <div className="stat-value">{stats.thisMonth}</div>
            <div className="stat-icon">
              <i className="fas fa-calendar-alt"></i> Current Month
            </div>
          </div>
        </div>

        {/* Improved Search and Filter Section */}
        <div className="search-filter-section">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder={`Search ${selectedRecord} records...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-panel">
            <div className="filter-header">
              <h3>Filters</h3>
              <button className="filter-reset" onClick={resetFilters}>
                <i className="fas fa-undo"></i> Reset
              </button>
            </div>
            
            <div className="filters">
              <div className="filter-group">
                <label>Date Range</label>
                <div className="date-range">
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, start: e.target.value } })}
                    placeholder="Start date"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, end: e.target.value } })}
                    placeholder="End date"
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Livestock Type</label>
                <select
                  value={filters.livestockType}
                  onChange={(e) => setFilters({ ...filters, livestockType: e.target.value })}
                >
                  <option value="">All Types</option>
                  {getUniqueValues("livestockType").map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {(selectedRecord === "egg" || selectedRecord === "milk") && (
                <div className="filter-group">
                  <label>Quality</label>
                  <select
                    value={filters.quality}
                    onChange={(e) => setFilters({ ...filters, quality: e.target.value })}
                  >
                    <option value="">All Qualities</option>
                    {getUniqueValues("quality").map((quality) => (
                      <option key={quality} value={quality}>
                        {formatQuality(quality)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="active-filters">
              {filters.dateRange.start && filters.dateRange.end && (
                <div className="filter-tag">
                  <span>Date: {new Date(filters.dateRange.start).toLocaleDateString()} - {new Date(filters.dateRange.end).toLocaleDateString()}</span>
                  <button onClick={() => setFilters({...filters, dateRange: {start: "", end: ""}})}><i className="fas fa-times"></i></button>
                </div>
              )}
              {filters.livestockType && (
                <div className="filter-tag">
                  <span>Type: {filters.livestockType.charAt(0).toUpperCase() + filters.livestockType.slice(1)}</span>
                  <button onClick={() => setFilters({...filters, livestockType: ""})}><i className="fas fa-times"></i></button>
                </div>
              )}
              {filters.quality && (
                <div className="filter-tag">
                  <span>Quality: {formatQuality(filters.quality)}</span>
                  <button onClick={() => setFilters({...filters, quality: ""})}><i className="fas fa-times"></i></button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {isFormVisible && (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editingId ? "Edit Record" : "Add New Record"}</h3>
                <button className="close-button" onClick={() => setIsFormVisible(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                {renderFormFields()}
                <div className="modal-buttons">
                  <button type="submit" className="submit-button">
                    <i className="fas fa-save"></i> {editingId ? "Update" : "Add"}
                  </button>
                  <button type="button" className="cancel-button" onClick={() => setIsFormVisible(false)}>
                    <i className="fas fa-times"></i> Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Records Table */}
        <div className="table-container">
          {filteredRecords.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Livestock Type</th>
                  {selectedRecord === "feeding" && <th>Feed Type</th>}
                  <th>Quantity</th>
                  {(selectedRecord === "egg" || selectedRecord === "milk") && <th>Quality</th>}
                  {selectedRecord === "death" && <th>Cause</th>}
                  {selectedRecord === "harvest-sale" && <th>Price</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record._id}>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td className="capitalize">{record.livestockType}</td>
                    {selectedRecord === "feeding" && <td className="capitalize">{record.feedType}</td>}
                    <td>
                      {record.quantity} 
                      {selectedRecord === "feeding" && " kg"}
                      {selectedRecord === "milk" && " L"}
                    </td>
                    {(selectedRecord === "egg" || selectedRecord === "milk") && (
                      <td>{renderQualityBadge(record.quality)}</td>
                    )}
                    {selectedRecord === "death" && <td className="capitalize">{record.cause}</td>}
                    {selectedRecord === "harvest-sale" && <td className="font-bold">${record.price}</td>}
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleEdit(record)} className="edit-button">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button onClick={() => handleDelete(record._id)} className="delete-button">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <i className="fas fa-folder-open"></i>
              <p>No records found. Add a new record or adjust your filters.</p>
              <button className="add-button" onClick={() => setIsFormVisible(true)}>
                <i className="fas fa-plus"></i> Add Record
              </button>
            </div>
          )}
        </div>
        
        {/* Pagination - Optional feature */}
        {filteredRecords.length > 10 && (
          <div className="pagination">
            <button className="pagination-button">
              <i className="fas fa-chevron-left"></i> Previous
            </button>
            <span className="pagination-info">Page 1 of {Math.ceil(filteredRecords.length / 10)}</span>
            <button className="pagination-button">
              Next <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get icons for record types
const getRecordIcon = (recordType) => {
  switch (recordType) {
    case "feeding":
      return "utensils";
    case "egg":
      return "egg";
    case "milk":
      return "glass-milk";
    case "death":
      return "heart-broken";
    case "harvest-sale":
      return "dollar-sign";
    default:
      return "clipboard-list";
  }
};

export default LivestockRecords;