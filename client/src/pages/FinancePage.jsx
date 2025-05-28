import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../utils/api'; // Ensure you are importing the configured api instance

const FinancePage = () => {
  const navigate = useNavigate(); // Initialize navigate hook
  const [activeTab, setActiveTab] = useState("report");
  const [transactionType, setTransactionType] = useState("income");
  const [category, setCategory] = useState("");
  const [batch, setBatch] = useState("");
  const [units, setUnits] = useState(1);
  const [costPerUnit, setCostPerUnit] = useState("");
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [sortField, setSortField] = useState("recordDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === "report") {
      fetchTransactions();
    }
  }, [activeTab, filterType, sortField, sortDirection]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/transactions'); // Use api.get
      let data = response.data;
      console.log(data);
      data = Array.isArray(data) ? data : [];
      
      // Normalize transaction data to ensure consistent format
      data = data.map(transaction => {
        // Create a normalized version of the transaction
        const normalizedTransaction = { ...transaction };
        
        // For transactions with description field but no batch (old format)
        if (transaction.description && !transaction.batch) {
          // Extract batch from description if it contains a hyphen
          const descParts = transaction.description.split(' - ');
          if (descParts.length > 1) {
            normalizedTransaction.batch = descParts[1];
          } else {
            normalizedTransaction.batch = '-';
          }
        }
        
        // Ensure date fields are consistent
        if (transaction.date && !transaction.recordDate) {
          normalizedTransaction.recordDate = transaction.date;
        }
        
        // Ensure units and costPerUnit are set if amount exists
        if (transaction.amount && (!transaction.units || !transaction.costPerUnit)) {
          normalizedTransaction.units = transaction.units || 1;
          normalizedTransaction.costPerUnit = transaction.amount / normalizedTransaction.units;
        }
        
        return normalizedTransaction;
      });
      
      // Apply filtering
      if (filterType !== "all") {
        data = data.filter(transaction => transaction.type === filterType);
      }
      
      // Apply sorting
      data.sort((a, b) => {
        if (sortField === "recordDate") {
          const dateA = new Date(a[sortField]);
          const dateB = new Date(b[sortField]);
          return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        } else if (sortField === "costPerUnit" || sortField === "units") {
          return sortDirection === "asc" 
            ? a[sortField] - b[sortField] 
            : b[sortField] - a[sortField];
        } else {
          return sortDirection === "asc"
            ? a[sortField]?.localeCompare(b[sortField])
            : b[sortField]?.localeCompare(a[sortField]);
        }
      });
      
      setTransactions(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
      setLoading(false); // Also set the main loading state to false
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Calculate the total amount
    const amount = Number(units) * Number(costPerUnit);
    
    const transactionData = {
      type: transactionType,
      category,
      batch,
      units: Number(units),
      costPerUnit: Number(costPerUnit),
      recordDate,  // Use recordDate as per the updated model
      notes,
    };

    try {
      let url = "/transactions"; // Use relative path as api utility handles base URL
      let method = "POST";
      
      if (editingTransaction) {
        url = `/transactions/${editingTransaction._id}`;
        method = "PUT";
      }
      console.log(transactionData);
      // Use api utility instead of fetch
      let response;
      if (method === "POST") {
        response = await api.post(url, transactionData);
      } else if (method === "PUT") {
        response = await api.put(url, transactionData);
      }

      if (response.status >= 200 && response.status < 300) {
        resetForm();
        setActiveTab("report");
      } else {
         // Handle non-2xx responses
        const errorData = response.data || { message: 'Failed to save transaction' };
        alert(`Failed to ${editingTransaction ? "update" : "save"} transaction: ${errorData.message}`);
      }
    } catch (error) {
      console.error(`Error ${editingTransaction ? "updating" : "saving"} transaction:`, error);
      alert(`An error occurred while ${editingTransaction ? "updating" : "saving"} the transaction.`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCategory("");
    setBatch("");
    setUnits(1);
    setCostPerUnit("");
    setNotes("");
    setTransactionType("income");
    setEditingTransaction(null);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setTransactionType(transaction.type);
    setCategory(transaction.category);
    setBatch(transaction.batch);
    setUnits(transaction.units);
    setCostPerUnit(transaction.costPerUnit);
    setRecordDate(transaction.recordDate.split("T")[0]);
    setNotes(transaction.notes || "");
    setActiveTab("addTransaction");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    
    setIsLoading(true);
    try {
      // Use api utility instead of fetch
      const response = await api.delete(`/transactions/${id}`);

       if (response.status >= 200 && response.status < 300) {
        fetchTransactions();
      } else {
        // Handle non-2xx responses
         const errorData = response.data || { message: 'Failed to delete transaction' };
        alert(`Failed to delete transaction: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
       alert("An error occurred while deleting the transaction.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const calculateTotalAmount = () => {
    const income = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => {
        return sum + (Number(t.units || 0) * Number(t.costPerUnit || 0));
      }, 0);
      
    const expense = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => {
        return sum + (Number(t.units || 0) * Number(t.costPerUnit || 0));
      }, 0);
      
    return {
      income: income.toFixed(2),
      expense: expense.toFixed(2),
      balance: (income - expense).toFixed(2)
    };
  };

  const totals = calculateTotalAmount();

  if (loading) {
    return <div>Loading transactions...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error loading transactions: {error}
        <button onClick={fetchTransactions}>Retry</button>
      </div>
    );
  }

  if (transactions.length === 0 && !loading && !error) {
    return <p>No transactions found.</p>;
  }

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>Financial Management</h1>
      
      {/* Navigation Tabs */}
      <div style={tabContainerStyle}>
        <button
          onClick={() => setActiveTab("report")}
          style={{
            ...tabStyle,
            backgroundColor: activeTab === "report" ? "#4b6584" : "#dcdde1",
            color: activeTab === "report" ? "white" : "#2f3640",
          }}
        >
          Transactions
        </button>
        <button
          onClick={() => {
            resetForm();
            setActiveTab("addTransaction");
          }}
          style={{
            ...tabStyle,
            backgroundColor: activeTab === "addTransaction" ? "#4b6584" : "#dcdde1",
            color: activeTab === "addTransaction" ? "white" : "#2f3640",
          }}
        >
          {editingTransaction ? "Edit Transaction" : "Add Transaction"}
        </button>
        <button
          onClick={() => navigate("/finance-analytics")}
          style={{
            ...tabStyle,
            backgroundColor: "#2ecc71",
            color: "white",
          }}
        >
          Analytics
        </button>
      </div>

      {/* Add Transaction Form */}
      {activeTab === "addTransaction" && (
        <div style={cardStyle}>
          <h2 style={cardHeaderStyle}>{editingTransaction ? "Edit Transaction" : "Add New Transaction"}</h2>
          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={typeButtonContainerStyle}>
              <button
                type="button"
                onClick={() => setTransactionType("income")}
                style={{
                  ...typeButtonStyle,
                  backgroundColor: transactionType === "income" ? "#badc58" : "#f5f6fa",
                  color: transactionType === "income" ? "#2f3640" : "#7f8fa6",
                  borderColor: transactionType === "income" ? "#6ab04c" : "#dcdde1",
                }}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setTransactionType("expense")}
                style={{
                  ...typeButtonStyle,
                  backgroundColor: transactionType === "expense" ? "#ff7979" : "#f5f6fa",
                  color: transactionType === "expense" ? "#2f3640" : "#7f8fa6",
                  borderColor: transactionType === "expense" ? "#eb4d4b" : "#dcdde1",
                }}
              >
                Expense
              </button>
            </div>

            <div style={formRowStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Category</label>
                <input 
                  type="text" 
                  placeholder="e.g., Salary, Groceries, Rent" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  required 
                  style={inputStyle} 
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Batch/Reference</label>
                <input 
                  type="text" 
                  placeholder="e.g., Invoice #123, Store name" 
                  value={batch} 
                  onChange={(e) => setBatch(e.target.value)} 
                  required 
                  style={inputStyle} 
                />
              </div>
            </div>

            <div style={formRowStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Number of Units</label>
                <input 
                  type="number" 
                  min="0.01" 
                  step="0.01"
                  value={units} 
                  onChange={(e) => setUnits(e.target.value)} 
                  required 
                  style={inputStyle} 
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Cost per Unit (USD)</label>
                <input 
                  type="number" 
                  min="0.01" 
                  step="0.01"
                  placeholder="0.00" 
                  value={costPerUnit} 
                  onChange={(e) => setCostPerUnit(e.target.value)} 
                  required 
                  style={inputStyle} 
                />
              </div>
            </div>

            <div style={formRowStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Date</label>
                <input 
                  type="date" 
                  value={recordDate} 
                  onChange={(e) => setRecordDate(e.target.value)} 
                  required 
                  style={inputStyle} 
                />
              </div>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Notes</label>
              <textarea 
                placeholder="Add any additional details here..." 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                style={{...inputStyle, minHeight: "80px"}}
              ></textarea>
            </div>

            <div style={formButtonsStyle}>
              <button 
                type="button" 
                onClick={() => {
                  resetForm();
                  setActiveTab("report");
                }} 
                style={cancelButtonStyle}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                style={submitButtonStyle}
              >
                {isLoading ? "Saving..." : editingTransaction ? "Update Transaction" : "Save Transaction"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transactions Report */}
      {activeTab === "report" && (
        <div style={cardStyle}>
          <h2 style={cardHeaderStyle}>Transaction History</h2>
          
          {/* Filters and Summary */}
          <div style={reportControlsStyle}>
            <div style={filterContainerStyle}>
              <label style={filterLabelStyle}>Filter by:</label>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                style={filterSelectStyle}
              >
                <option value="all">All Transactions</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>
            </div>
            
            <div style={summaryContainerStyle}>
              <div style={{...summaryBoxStyle, backgroundColor: "#badc58"}}>
                <div style={summaryLabelStyle}>Income</div>
                <div style={summaryAmountStyle}>${totals.income}</div>
              </div>
              <div style={{...summaryBoxStyle, backgroundColor: "#ff7979"}}>
                <div style={summaryLabelStyle}>Expenses</div>
                <div style={summaryAmountStyle}>${totals.expense}</div>
              </div>
              <div style={{
                ...summaryBoxStyle, 
                backgroundColor: parseFloat(totals.balance) >= 0 ? "#7bed9f" : "#ff6b6b"
              }}>
                <div style={summaryLabelStyle}>Balance</div>
                <div style={summaryAmountStyle}>${totals.balance}</div>
              </div>
            </div>
          </div>
          
          {/* Transaction Table */}
          {isLoading ? (
            <div style={loadingStyle}>Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div style={emptyStateStyle}>
              <p>No transactions found. Click "Add Transaction" to get started.</p>
            </div>
          ) : (
            <div style={tableContainerStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>
                      <div style={sortableHeaderStyle} onClick={() => handleSort("type")}>
                        Type
                        {sortField === "type" && (
                          <span>{sortDirection === "asc" ? " ↑" : " ↓"}</span>
                        )}
                      </div>
                    </th>
                    <th style={tableHeaderStyle}>
                      <div style={sortableHeaderStyle} onClick={() => handleSort("category")}>
                        Category
                        {sortField === "category" && (
                          <span>{sortDirection === "asc" ? " ↑" : " ↓"}</span>
                        )}
                      </div>
                    </th>
                    <th style={tableHeaderStyle}>
                      <div style={sortableHeaderStyle} onClick={() => handleSort("batch")}>
                        Batch
                        {sortField === "batch" && (
                          <span>{sortDirection === "asc" ? " ↑" : " ↓"}</span>
                        )}
                      </div>
                    </th>
                    <th style={tableHeaderStyle}>
                      <div style={sortableHeaderStyle} onClick={() => handleSort("units")}>
                        Units
                        {sortField === "units" && (
                          <span>{sortDirection === "asc" ? " ↑" : " ↓"}</span>
                        )}
                      </div>
                    </th>
                    <th style={tableHeaderStyle}>
                      <div style={sortableHeaderStyle} onClick={() => handleSort("costPerUnit")}>
                        Unit Cost
                        {sortField === "costPerUnit" && (
                          <span>{sortDirection === "asc" ? " ↑" : " ↓"}</span>
                        )}
                      </div>
                    </th>
                    <th style={tableHeaderStyle}>
                      <div style={sortableHeaderStyle} onClick={() => handleSort("recordDate")}>
                        Date
                        {sortField === "recordDate" && (
                          <span>{sortDirection === "asc" ? " ↑" : " ↓"}</span>
                        )}
                      </div>
                    </th>
                    <th style={tableHeaderStyle}>Total</th>
                    <th style={tableHeaderStyle}>Notes</th>
                    <th style={tableHeaderStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction._id} style={{
                      ...tableRowStyle,
                      backgroundColor: transaction.type === "income" ? "#f1f9eb" : "#fff5f5"
                    }}>
                      <td style={tableCellStyle}>
                        <span style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          backgroundColor: transaction.type === "income" ? "#badc58" : "#ff7979",
                          color: "#2f3640",
                          fontWeight: "bold",
                          fontSize: "12px"
                        }}>
                          {transaction.type === "income" ? "Income" : "Expense"}
                        </span>
                      </td>
                      <td style={tableCellStyle}>{transaction.category}</td>
                      <td style={tableCellStyle}>{transaction.batch || '-'}</td>
                      <td style={tableCellStyle}>{transaction.units || '-'}</td>
                      <td style={tableCellStyle}>
                        ${transaction.costPerUnit ? Number(transaction.costPerUnit).toFixed(2) : '0.00'}
                      </td>
                      <td style={tableCellStyle}>
                        {transaction.recordDate ? new Date(transaction.recordDate).toLocaleDateString() :
                         transaction.date ? new Date(transaction.date).toLocaleDateString() : '-'}
                      </td>
                      <td style={{...tableCellStyle, fontWeight: "bold"}}>
                        ${transaction.amount ? Number(transaction.amount).toFixed(2) :
                          (transaction.units && transaction.costPerUnit) ? (Number(transaction.units) * Number(transaction.costPerUnit)).toFixed(2) : '0.00'}
                      </td>
                      <td style={tableCellStyle}>{transaction.notes}</td>
                      <td style={tableCellStyle}>
                        <div style={actionButtonsStyle}>
                          <button 
                            onClick={() => handleEdit(transaction)} 
                            style={editButtonStyle}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(transaction._id)} 
                            style={deleteButtonStyle}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Improved styles
const containerStyle = {
  fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "20px",
  color: "#2f3640",
};

const headerStyle = {
  textAlign: "center",
  margin: "0 0 20px",
  color: "#2f3640",
  fontSize: "28px",
};

const tabContainerStyle = {
  display: "flex",
  justifyContent: "center",
  marginBottom: "20px",
  gap: "10px",
};

const tabStyle = {
  padding: "12px 24px",
  width: "200px",
  border: "none",
  fontSize: "16px",
  cursor: "pointer",
  borderRadius: "8px",
  fontWeight: "bold",
  transition: "all 0.2s ease",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

const cardStyle = {
  padding: "24px",
  borderRadius: "12px",
  background: "white",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const cardHeaderStyle = {
  margin: "0 0 20px",
  fontSize: "20px",
  fontWeight: "600",
  color: "#2f3640",
  borderBottom: "2px solid #f1f2f6",
  paddingBottom: "10px",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const formRowStyle = {
  display: "flex",
  gap: "20px",
  flexWrap: "wrap",
};

const formGroupStyle = {
  flex: "1 1 300px",
  display: "flex",
  flexDirection: "column",
};

const labelStyle = {
  marginBottom: "8px",
  fontWeight: "500",
  fontSize: "14px",
  color: "#7f8fa6",
};

const inputStyle = {
  padding: "12px",
  border: "1px solid #dcdde1",
  borderRadius: "8px",
  fontSize: "16px",
  transition: "border 0.2s ease",
  outline: "none",
};

const typeButtonContainerStyle = {
  display: "flex",
  gap: "10px",
};

const typeButtonStyle = {
  flex: 1,
  padding: "12px",
  border: "2px solid",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const formButtonsStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "10px",
};

const submitButtonStyle = {
  padding: "12px 24px",
  backgroundColor: "#4b6584",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "background-color 0.2s ease",
};

const cancelButtonStyle = {
  padding: "12px 24px",
  backgroundColor: "#dcdde1",
  color: "#2f3640",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "background-color 0.2s ease",
};

const reportControlsStyle = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  marginBottom: "20px",
};

const filterContainerStyle = {
  display: "flex",
  alignItems: "center",
};

const filterLabelStyle = {
  marginRight: "10px",
  fontWeight: "500",
};

const filterSelectStyle = {
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid #dcdde1",
  backgroundColor: "white",
  cursor: "pointer",
  outline: "none",
};

const summaryContainerStyle = {
  display: "flex",
  gap: "15px",
  flexWrap: "wrap",
};

const summaryBoxStyle = {
  padding: "12px 20px",
  borderRadius: "8px",
  minWidth: "140px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

const summaryLabelStyle = {
  fontSize: "14px",
  fontWeight: "500",
  marginBottom: "4px",
};

const summaryAmountStyle = {
  fontSize: "20px",
  fontWeight: "bold",
};

const tableContainerStyle = {
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  borderRadius: "8px",
  overflow: "hidden",
};

const tableHeaderStyle = {
  backgroundColor: "#f1f2f6",
  padding: "12px 15px",
  textAlign: "left",
  fontSize: "14px",
  fontWeight: "600",
};

const sortableHeaderStyle = {
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};

const tableRowStyle = {
  borderBottom: "1px solid #dcdde1",
};

const tableCellStyle = {
  padding: "12px 15px",
  verticalAlign: "middle",
};

const actionButtonsStyle = {
  display: "flex",
  gap: "5px",
};

const editButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "#74b9ff",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "13px",
};

const deleteButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "#ff7979",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "13px",
};

const loadingStyle = {
  textAlign: "center",
  padding: "30px",
  color: "#7f8fa6",
};

const emptyStateStyle = {
  textAlign: "center",
  padding: "40px 20px",
  color: "#7f8fa6",
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
};

export default FinancePage;