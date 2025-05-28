import React, { useState, useEffect } from "react";
import axios from "axios";

const PestPesticideInfo = () => {
  const [selectedSection, setSelectedSection] = useState("pests");
  const [data, setData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", details: "", control: "", image: "", type: "" });
  const [editingId, setEditingId] = useState(null);

  // Fetch data from backend
  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/pest-pesticide/get", {
        // params: { type: selectedSection },
      });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data. Please check the console for details.");
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSection]);

  const handleEdit = (item) => {
    setFormData({ name: item.name, details: item.details, control: item.control, image: item.image, type: item.type });
    setEditingId(item._id);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/pest-pesticide/${id}`);
      setData(data.filter((item) => item._id !== id));
      alert("Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please check the console for details.");
    }
  };

  const handleAddOrUpdate = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("details", formData.details);
      formDataToSend.append("control", formData.control);
      formDataToSend.append("type", selectedSection);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      let response;
      if (editingId) {
        // Update data
        response = await axios.put(`http://localhost:5000/api/pest-pesticide/${editingId}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setData(data.map((item) => (item._id === editingId ? response.data : item)));
      } else {
        // Add new data
        response = await axios.post("http://localhost:5000/api/pest-pesticide/add-pesticide", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setData([...data, response.data]);
      }

      setIsEditing(false);
      setFormData({ name: "", details: "", control: "", image: "", type: "" });
      setEditingId(null);
      alert(editingId ? "Item updated successfully!" : "Item added successfully!");
    } catch (error) {
      console.error("Error adding/updating item:", error);
      alert("Failed to add/update item. Please check the console for details.");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ name: "", details: "", control: "", image: "", type: "" });
    setEditingId(null);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f4f4", fontFamily: "Arial, sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: "250px", background: "#fff", padding: "20px", boxShadow: "2px 0px 5px rgba(0,0,0,0.1)" }}>
        <h2 style={{ color: "#007BFF", fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>Information</h2>
        <button
          onClick={() => setSelectedSection("pests")}
          style={{ width: "100%", padding: "10px", borderRadius: "5px", background: "#f0f0f0", border: "none", cursor: "pointer", marginBottom: "10px" }}
        >
          Pests
        </button>
        <button
          onClick={() => setSelectedSection("pesticides")}
          style={{ width: "100%", padding: "10px", borderRadius: "5px", background: "#f0f0f0", border: "none", cursor: "pointer" }}
        >
          Pesticides
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ color: "#007BFF", fontSize: "24px", fontWeight: "bold" }}>
            {selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)}
          </h2>
          <button
            onClick={() => {
              setIsEditing(true);
              setFormData({ name: "", details: "", control: "", image: "", type: "" });
              setEditingId(null);
            }}
            style={{ background: "#007BFF", color: "white", padding: "8px 15px", borderRadius: "5px", border: "none", cursor: "pointer" }}
          >
            + Add
          </button>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginTop: "20px" }}>
          {data.map((item) => (
            <div key={item._id} style={{ background: "white", padding: "15px", borderRadius: "10px", boxShadow: "0px 3px 6px rgba(0,0,0,0.1)", position: "relative" }}>
              <img src={`http://localhost:5000/${item.image}`} alt={item.name} style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "5px" }} />
              <h3 style={{ marginTop: "10px", fontSize: "18px", fontWeight: "bold" }}>{item.name}</h3>
              <p><strong>Description:</strong> {item.details}</p>
              <p><strong>Control:</strong> {item.control}</p>
              <button
                onClick={() => handleEdit(item)}
                style={{ marginRight: "10px", padding: "5px 10px", border: "none", background: "#007BFF", color: "white", borderRadius: "5px", cursor: "pointer" }}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item._id)}
                style={{ padding: "5px 10px", border: "none", background: "#FF4D4D", color: "white", borderRadius: "5px", cursor: "pointer" }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* Add/Edit Modal */}
        {isEditing && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
            <div style={{ background: "white", padding: "20px", borderRadius: "10px", width: "350px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>{editingId ? "Edit" : "Add"} {selectedSection.slice(0, -1)}</h3>
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: "100%", padding: "8px", marginTop: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
              />
              <input
                type="text"
                placeholder="Description"
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                style={{ width: "100%", padding: "8px", marginTop: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
              />
              <input
                type="text"
                placeholder="Control"
                value={formData.control}
                onChange={(e) => setFormData({ ...formData, control: e.target.value })}
                style={{ width: "100%", padding: "8px", marginTop: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
              />
              <input
                type="file"
                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                style={{ width: "100%", marginTop: "10px" }}
              />
              <button
                onClick={handleAddOrUpdate}
                style={{ marginTop: "10px", width: "100%", padding: "10px", border: "none", background: "#007BFF", color: "white", borderRadius: "5px", cursor: "pointer" }}
              >
                {editingId ? "Update" : "Add"}
              </button>
              <button
                onClick={handleCancel}
                style={{ marginTop: "10px", width: "100%", padding: "10px", border: "none", background: "#FF4D4D", color: "white", borderRadius: "5px", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PestPesticideInfo;