import { alpha } from '@mui/material/styles';

export const tableStyles = {
  tableContainer: {
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  table: {
    minWidth: 650,
  },
  tableHead: {
    backgroundColor: '#28a745',
    '& th': {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: '14px',
      padding: '16px',
    },
  },
  tableBody: {
    '& tr:nth-of-type(odd)': {
      backgroundColor: alpha('#28a745', 0.05),
    },
    '& tr:hover': {
      backgroundColor: alpha('#28a745', 0.1),
    },
  },
  tableCell: {
    padding: '12px 16px',
    fontSize: '14px',
    color: '#333',
  },
  tableRow: {
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  },
  pagination: {
    backgroundColor: '#fff',
    padding: '8px',
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
  },
  actionButton: {
    color: '#28a745',
    '&:hover': {
      backgroundColor: alpha('#28a745', 0.1),
    },
  },
  statusChip: {
    success: {
      backgroundColor: alpha('#28a745', 0.1),
      color: '#28a745',
    },
    warning: {
      backgroundColor: alpha('#ffc107', 0.1),
      color: '#ffc107',
    },
    error: {
      backgroundColor: alpha('#dc3545', 0.1),
      color: '#dc3545',
    },
    info: {
      backgroundColor: alpha('#17a2b8', 0.1),
      color: '#17a2b8',
    },
  },
  searchField: {
    marginBottom: '16px',
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      '&:hover fieldset': {
        borderColor: '#28a745',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#28a745',
      },
    },
  },
  filterButton: {
    color: '#28a745',
    borderColor: '#28a745',
    '&:hover': {
      borderColor: '#218838',
      backgroundColor: alpha('#28a745', 0.1),
    },
  },
  exportButton: {
    backgroundColor: '#28a745',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#218838',
    },
  },
}; 