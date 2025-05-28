import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import LandingPage from "./LandingPage";
import CropsNavigation from "./components/CropsNavigation";
import CropForm from "./components/CropForm";
import MedicalRecordsForm from "./components/MedicalRecordsForm";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HarvestingRecordsForm from "./components/HarvestingRecordsForm";
import LivestockNavigation from "./components/LivestockNavigation";
import LivestockBatches from "./components/LivestockBatches";
import LivestockRecords from "./components/LivestockRecords";
import LivestockMedicalRecords from "./components/LivestockMedicalRecords";
import LivestockBreeding from "./components/LivestockBreeding";
// import PestPesticideInfo from "./pages/PestPesticideInfo";
import WeatherPage from "./pages/WeatherPage"; 
import FinancePage from "./pages/FinancePage";
import InventoryPage from "./pages/InventoryPage"; 
import CropAnalytics from "./pages/CropAnalytics";
import PestPesticideInfo from "./pages/PestPesticideInfo";
// import LivestockAnalytics from "./pages/LivestockAnalytics";
import FinanceAnalytics from "./pages/FinanceAnalytics";
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import { Box, CssBaseline, ThemeProvider, createTheme, useMediaQuery, useTheme } from '@mui/material';
import Analytics from './components/Analytics';
import Dashboard from "./pages/Dashboard";
import NotificationPage from './pages/NotificationPage';

// Create a system-like theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a73e8',
      light: '#4285f4',
      dark: '#0d47a1',
    },
    secondary: {
      main: '#34a853',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#202124',
      secondary: '#5f6368',
    },
    divider: '#dadce0',
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#202124',
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 4,
          padding: '8px 16px',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #dadce0',
        },
      },
    },
  },
});

// **Private Route Wrapper**
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const lastActivity = localStorage.getItem("lastActivity");
  const currentTime = new Date().getTime();
  const inactiveTime = 30 * 60 * 1000; // 30 minutes in milliseconds

  // Check if user has been inactive for more than 30 minutes
  if (token && lastActivity && (currentTime - parseInt(lastActivity)) > inactiveTime) {
    localStorage.removeItem("token");
    localStorage.removeItem("lastActivity");
    // Use window.location.href to force full page reload and clear state
    window.location.href = "/login";
    return null; // Return null to prevent rendering
  }

  // Update last activity time
  if (token) {
    localStorage.setItem("lastActivity", currentTime.toString());
  }

  // Use Navigate component for redirection within React Router
  return token ? children : <Navigate to="/login" replace />;
};

// **Public Route Wrapper**
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
   // Use Navigate component for redirection within React Router
  return !token ? children : <Navigate to="/dashboard" replace />;
};

// Create a new AppContent component that uses useLocation
const AppContent = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const drawerWidth = 280;
  const location = useLocation();

  // Update last activity time on any user interaction
  useEffect(() => {
    const updateActivity = () => {
      if (localStorage.getItem("token")) {
        localStorage.setItem("lastActivity", new Date().getTime().toString());
      }
    };

    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("click", updateActivity);
    window.addEventListener("scroll", updateActivity);

    return () => {
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("click", updateActivity);
      window.removeEventListener("scroll", updateActivity);
    };
  }, []);

  // Determine if the sidebar should be visible
  const showSidebar = user && !['/login', '/signup', '/PestPesticideInfo'].includes(location.pathname);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Navbar at the top */}
        <Box sx={{ position: 'fixed', width: '100%', zIndex: 1200 }}>
          <Navbar />
        </Box>

        {/* Main content area with sidebar */}
        <Box sx={{ display: 'flex', flexGrow: 1, mt: '64px' }}> {/* 64px is typical AppBar height */}
          {/* Sidebar */}
          {showSidebar && (
            <Box
              component="nav"
              sx={{
                width: { sm: drawerWidth },
                flexShrink: { sm: 0 },
                position: 'fixed',
                height: 'calc(100vh - 64px)',
                top: '64px',
              }}
            >
              <Sidebar />
            </Box>
          )}

          {/* Main content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: showSidebar ? `calc(100% - ${drawerWidth}px)` : '100%' },
              ml: { sm: showSidebar ? `${drawerWidth}px` : 0 },
              backgroundColor: '#f8f9fa',
              minHeight: 'calc(100vh - 64px)',
            }}
          >
            <Routes>
              {/* Public routes */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <PublicRoute>
                    <SignupPage />
                  </PublicRoute>
                } 
              />
              <Route path="/PestPesticideInfo" element={<PublicRoute><PestPesticideInfo /></PublicRoute>} />
              {/* Landing page is public and should not redirect logged in users */}
              <Route path="/" element={<LandingPage />} /> 

              {/* Protected routes - Wrapped with PrivateRoute */}              
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
              <Route path="/weather" element={<PrivateRoute><WeatherPage /></PrivateRoute>} />
              <Route path="/finance" element={<PrivateRoute><FinancePage /></PrivateRoute>} />
              <Route path="/inventory" element={<PrivateRoute><InventoryPage /></PrivateRoute>} />
              <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
              <Route path="/notifications" element={<PrivateRoute><NotificationPage /></PrivateRoute>} />
              <Route path="/crop-analytics" element={<PrivateRoute><CropAnalytics /></PrivateRoute>} />
              <Route path="/finance-analytics" element={<PrivateRoute><FinanceAnalytics /></PrivateRoute>} />

              {/* Nested Protected Routes (Crops and Livestock) - Wrapped with PrivateRoute */}
              <Route path="/crops/*" element={<PrivateRoute><CropsNavigation /></PrivateRoute>} />
              <Route path="/livestocks/*" element={<PrivateRoute><LivestockNavigation /></PrivateRoute>} />

              {/* Catch all route - redirects to dashboard if logged in, login if not */}
              <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

// Main App component that wraps everything with Router
const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;