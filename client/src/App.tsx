import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Componentes
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Configuration from './pages/Configuration/Configuration';
import Analytics from './pages/Analytics/Analytics';
import BienimedAnalytics from './pages/Analytics/BienimedAnalytics';
import Visualization from './pages/Visualization/Visualization';
import Integration from './pages/Integration/Integration';
import Login from './pages/Auth/Login';
import PatientFlowPage from './pages/PatientFlow/PatientFlowPage';

// Hooks
import { useAuth } from './hooks/useAuth';

// Estilos personalizados BieniMedico
import './styles/bienimedico.css';

// Configuración del tema - Estilo BieniMedico
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#7367f0', // Púrpura principal de BieniMedico
      light: '#9c88ff',
      dark: '#5a52d5',
    },
    secondary: {
      main: '#7367f0', // Púrpura de BieniMedico
      light: '#9c88ff',
      dark: '#5a52d5',
    },
    error: {
      main: '#ea5455', // Rojo de BieniMedico
      light: '#ff6b6b',
      dark: '#d63031',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    success: {
      main: '#55bcba', // Verde/Azul claro de BieniMedico
      light: '#7dd3d0',
      dark: '#3a9a97',
    },
    info: {
      main: '#7367f0',
      light: '#9c88ff',
      dark: '#5a52d5',
    },
    text: {
      primary: '#3e4954', // Gris oscuro de BieniMedico
      secondary: '#6e6b7b', // Gris medio de BieniMedico
    },
    background: {
      default: '#f8f9fa', // Fondo claro como en BieniMedico
      paper: '#ffffff',
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 900,
      color: '#3e4954',
    },
    h2: {
      fontWeight: 900,
      color: '#3e4954',
    },
    h3: {
      fontWeight: 700,
      color: '#3e4954',
    },
    h4: {
      fontWeight: 700,
      color: '#3e4954',
    },
    h5: {
      fontWeight: 600,
      color: '#3e4954',
    },
    h6: {
      fontWeight: 600,
      color: '#3e4954',
    },
    body1: {
      color: '#3e4954',
    },
    body2: {
      color: '#6e6b7b',
    },
  },
  shape: {
    borderRadius: 8, // Bordes redondeados como en BieniMedico (0.5rem = 8px)
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: '#7367f0',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#5a52d5',
          },
        },
        outlined: {
          borderColor: '#7367f0',
          color: '#7367f0',
          '&:hover': {
            backgroundColor: 'rgba(115, 103, 240, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },
  },
});

// Configuración de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

// Componente de ruta protegida
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Componente de ruta pública
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            {/* Rutas públicas */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* Rutas protegidas */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/patient-flow" element={<PatientFlowPage />} />
                      <Route path="/configuration" element={<Configuration />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/bienimed-analytics" element={<BienimedAnalytics />} />
                      <Route path="/visualization" element={<Visualization />} />
                      <Route path="/integration" element={<Integration />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;