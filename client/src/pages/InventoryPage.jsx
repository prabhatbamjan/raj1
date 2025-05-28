import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Box,
  Card,
  CardContent,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Chip,
  Tooltip,
  TablePagination,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';

const InventoryPage = () => {
  const theme = useTheme();
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    quantity: '',
    unit: '',
    minThreshold: '',
    location: '',
    lastUpdated: new Date().toISOString().split('T')[0],
  });
  const [newCategory, setNewCategory] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [uniqueLocations, setUniqueLocations] = useState([]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    // Apply filters and search when inventory, search term, or filters change
    applyFiltersAndSearch();
    
    // Update unique categories and locations
    if (inventory.length > 0) {
      setUniqueCategories([...new Set(inventory.map(item => item.category).filter(Boolean))]);
      setUniqueLocations([...new Set(inventory.map(item => item.location).filter(Boolean))]);
    }
  }, [inventory, searchTerm, categoryFilter, locationFilter, stockFilter]);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory');
      setInventory(response.data);
      setFilteredInventory(response.data);
      
      // Extract unique categories and locations
      setUniqueCategories([...new Set(response.data.map(item => item.category).filter(Boolean))]);
      setUniqueLocations([...new Set(response.data.map(item => item.location).filter(Boolean))]);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err.response?.data?.message || 'Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let result = [...inventory];

    // Apply search term
    if (searchTerm) {
      result = result.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter) {
      result = result.filter(item => item.category === categoryFilter);
    }

    // Apply location filter
    if (locationFilter) {
      result = result.filter(item => item.location === locationFilter);
    }

    // Apply stock level filter
    if (stockFilter === 'low') {
      result = result.filter(item => item.quantity <= item.minThreshold);
    } else if (stockFilter === 'out') {
      result = result.filter(item => item.quantity === 0);
    }

    setFilteredInventory(result);
    setPage(0); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setLocationFilter('');
    setStockFilter('all');
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        ...item,
        lastUpdated: new Date().toISOString().split('T')[0],
      });
    } else {
      setSelectedItem(null);
      setFormData({
        itemName: '',
        category: '',
        quantity: '',
        unit: '',
        minThreshold: '',
        location: '',
        lastUpdated: new Date().toISOString().split('T')[0],
      });
    }
    setNewCategory('');
    setNewLocation('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
    setNewCategory('');
    setNewLocation('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await api.put(`/inventory/${selectedItem._id}`, formData);
      } else {
        await api.post('/inventory', formData);
      }
      setOpenDialog(false);
      fetchInventory();
    } catch (err) {
      setError('Failed to save inventory item');
      console.error('Error saving inventory:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/inventory/${id}`);
      fetchInventory();
    } catch (err) {
      setError('Failed to delete inventory item');
      console.error('Error deleting inventory:', err);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Data for charts
  const categoryData = inventory.reduce((acc, item) => {
    const category = acc.find(cat => cat.name === item.category);
    if (category) {
      category.value += parseInt(item.quantity);
    } else if (item.category) {
      acc.push({ name: item.category, value: parseInt(item.quantity) });
    }
    return acc;
  }, []);

  const locationData = inventory.reduce((acc, item) => {
    const existingLocation = acc.find(loc => loc.name === item.location);
    if (existingLocation) {
      existingLocation.value += parseInt(item.quantity);
    } else if (item.location) {
      acc.push({ name: item.location, value: parseInt(item.quantity) });
    }
    return acc;
  }, []);

  const lowStockItems = inventory.filter(item => item.quantity <= item.minThreshold);
  const outOfStockItems = inventory.filter(item => item.quantity === 0);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error loading inventory: {error}
        <button onClick={fetchInventory}>Retry</button>
      </div>
    );
  }

  if (inventory.length === 0 && !loading && !error) {
    return <p>No inventory items found.</p>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ 
        fontWeight: 'bold', 
        color: theme.palette.primary.main,
        mb: 3
      }}>
        Inventory Management System
      </Typography>

      {/* Dashboard Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Status Cards */}
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: 3,
            height: '100%',
            backgroundColor: theme.palette.primary.light,
            color: theme.palette.primary.contrastText
          }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                Total Items
              </Typography>
              <Typography variant="h3" sx={{ mt: 2, fontWeight: 'medium' }}>
                {inventory.length}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                across {uniqueCategories.length} categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: 3,
            height: '100%',
            backgroundColor: '#ff9800',
            color: 'white'
          }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                Low Stock
              </Typography>
              <Typography variant="h3" sx={{ mt: 2, fontWeight: 'medium' }}>
                {lowStockItems.length}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                items below threshold
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: 3,
            height: '100%',
            backgroundColor: theme.palette.error.main,
            color: theme.palette.error.contrastText
          }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                Out of Stock
              </Typography>
              <Typography variant="h3" sx={{ mt: 2, fontWeight: 'medium' }}>
                {outOfStockItems.length}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                items need reordering
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            borderRadius: 2, 
            boxShadow: 3,
            height: '100%',
            backgroundColor: theme.palette.success.main,
            color: theme.palette.success.contrastText
          }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                Locations
              </Typography>
              <Typography variant="h3" sx={{ mt: 2, fontWeight: 'medium' }}>
                {uniqueLocations.length}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                storage areas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Category Distribution */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 300,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Inventory by Category
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => [`${value} units`, 'Quantity']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Location Distribution */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 300,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Inventory by Location
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={locationData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip formatter={(value) => [`${value} units`, 'Quantity']} />
                <Bar dataKey="value" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Low Stock Alerts */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          mb: 4,
          borderLeft: lowStockItems.length > 0 ? `6px solid ${theme.palette.warning.main}` : 'none',
        }}
      >
        <Box display="flex" alignItems="center" mb={2}>
          {lowStockItems.length > 0 && <WarningIcon color="warning" sx={{ mr: 1 }} />}
          <Typography variant="h6" fontWeight="medium">
            Low Stock Alerts ({lowStockItems.length})
          </Typography>
        </Box>
        
        {lowStockItems.length > 0 ? (
          <TableContainer sx={{ maxHeight: 200 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Item Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Current Quantity</TableCell>
                  <TableCell>Minimum Threshold</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lowStockItems.map(item => (
                  <TableRow key={item._id} 
                    sx={{ backgroundColor: item.quantity === 0 ? theme.palette.error.light : 'inherit' }}
                  >
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.quantity} {item.unit}</TableCell>
                    <TableCell>{item.minThreshold} {item.unit}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenDialog(item)} color="primary">
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body1" color="textSecondary">
            No low stock items to display. All inventory levels are above their minimum thresholds.
          </Typography>
        )}
      </Paper>

      {/* Search and Filter Bar */}
      <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Box display="flex" gap={2} flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {uniqueCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Location</InputLabel>
                <Select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  label="Location"
                >
                  <MenuItem value="">All Locations</MenuItem>
                  {uniqueLocations.map((location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Stock Level</InputLabel>
                <Select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  label="Stock Level"
                >
                  <MenuItem value="all">All Items</MenuItem>
                  <MenuItem value="low">Low Stock</MenuItem>
                  <MenuItem value="out">Out of Stock</MenuItem>
                </Select>
              </FormControl>
              
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={resetFilters}
                size="medium"
              >
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        {/* Active filters */}
        {(searchTerm || categoryFilter || locationFilter || stockFilter !== 'all') && (
          <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
            <Typography variant="body2" color="textSecondary" sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
              <FilterIcon fontSize="small" sx={{ mr: 0.5 }} /> Active Filters:
            </Typography>
            
            {searchTerm && (
              <Chip 
                size="small" 
                label={`Search: "${searchTerm}"`} 
                onDelete={() => setSearchTerm('')} 
                color="primary" 
                variant="outlined"
              />
            )}
            
            {categoryFilter && (
              <Chip 
                size="small" 
                label={`Category: ${categoryFilter}`} 
                onDelete={() => setCategoryFilter('')} 
                color="primary" 
                variant="outlined"
              />
            )}
            
            {locationFilter && (
              <Chip 
                size="small" 
                label={`Location: ${locationFilter}`} 
                onDelete={() => setLocationFilter('')} 
                color="primary" 
                variant="outlined"
              />
            )}
            
            {stockFilter !== 'all' && (
              <Chip 
                size="small" 
                label={`Stock: ${stockFilter === 'low' ? 'Low Stock' : 'Out of Stock'}`}
                onDelete={() => setStockFilter('all')}
                color={stockFilter === 'low' ? 'warning' : 'error'}
                variant="outlined"
              />
            )}
          </Box>
        )}
      </Paper>

      {/* Inventory List */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="medium">
            Inventory List
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Min Threshold</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInventory.length > 0 ? (
                filteredInventory
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow 
                      key={item._id}
                      sx={{
                        backgroundColor: item.quantity === 0 
                          ? theme.palette.error.light 
                          : (item.quantity <= item.minThreshold ? theme.palette.warning.light : 'inherit')
                      }}
                    >
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell>
                        <Chip 
                          size="small" 
                          label={item.category} 
                          sx={{ borderRadius: 1 }}
                        />
                      </TableCell>
                      <TableCell>
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell>{item.minThreshold} {item.unit}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>{item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleOpenDialog(item)} color="primary" size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDelete(item._id)} color="error" size="small">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box py={2}>
                      <Typography variant="body1" color="textSecondary">
                        No inventory items found matching your search criteria.
                      </Typography>
                      <Button 
                        variant="text" 
                        onClick={resetFilters} 
                        sx={{ mt: 1 }}
                        startIcon={<RefreshIcon />}
                      >
                        Reset Filters
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredInventory.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
          {selectedItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Item Name"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label="Category"
                >
                  {uniqueCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                  <MenuItem value="other">
                    <em>Add New Category</em>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.category === 'other' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Category Name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  required
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Threshold"
                type="number"
                value={formData.minThreshold}
                onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                required
                helperText="Alert will show when quantity falls below this value"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Location</InputLabel>
                <Select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  label="Location"
                >
                  {uniqueLocations.map((location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                  <MenuItem value="other">
                    <em>Add New Location</em>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.location === 'other' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Location Name"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  required
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Last Updated"
                type="date"
                value={formData.lastUpdated}
                onChange={(e) => setFormData({ ...formData, lastUpdated: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            startIcon={selectedItem ? <EditIcon /> : <AddIcon />}
            disabled={
              !formData.itemName || 
              !formData.quantity || 
              !formData.unit || 
              !formData.minThreshold || 
              (formData.category === 'other' && !newCategory) || 
              (formData.location === 'other' && !newLocation) ||
              (!formData.category && formData.category !== 'other') || 
              (!formData.location && formData.location !== 'other')
            }
          >
            {selectedItem ? 'Update Item' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InventoryPage;