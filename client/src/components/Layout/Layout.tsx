import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Settings,
  Analytics,
  Timeline,
  IntegrationInstructions,
  LocalHospital,
  People,
  Assessment,
  Notifications,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import BieniMedicoLogo from '../Logo/BieniMedicoLogo';

const drawerWidth = 280; // Más ancho como en BieniMedico
const collapsedDrawerWidth = 80; // Ancho cuando está colapsado (solo iconos)

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Flujos y Costos', icon: <Timeline />, path: '/patient-flow' },
  { text: 'Configuración', icon: <Settings />, path: '/configuration' },
  { text: 'Analítica', icon: <Analytics />, path: '/analytics' },
  { text: 'Visualización', icon: <Timeline />, path: '/visualization' },
  { text: 'Integración', icon: <IntegrationInstructions />, path: '/integration' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true); // Estado para desktop
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#f8f9fa',
    }}>
      {/* Header con logo/icono como en BieniMedico */}
      <Box sx={{ 
        p: 2, // Padding consistente con el header principal
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: desktopOpen ? 'flex-start' : 'center',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#ffffff',
        minHeight: 64, // Altura mínima igual al header principal
      }}>
        <Box sx={{ 
          width: 48, 
          height: 48, 
          borderRadius: '50%', 
          backgroundColor: '#ffffff', // Color teal del estetoscopio de BieniMedico
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mr: desktopOpen ? 2 : 0,
        }}>
          <BieniMedicoLogo size={24} color="#ffffff" />
        </Box>
        {desktopOpen && (
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            color: '#3e4954',
            fontSize: '1.1rem',
          }}>
            Patient Journey
          </Typography>
        )}
      </Box>
      
      {/* Lista de navegación */}
      <Box sx={{ flexGrow: 1, p: desktopOpen ? 2 : 1 }}>
        <List sx={{ p: 0 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  justifyContent: desktopOpen ? 'flex-start' : 'center',
                  minHeight: 48,
                  '&.Mui-selected': {
                    backgroundColor: '#7367f0',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#5a52d5',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#ffffff',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(115, 103, 240, 0.08)',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: desktopOpen ? 40 : 'auto',
                  color: location.pathname === item.path ? '#ffffff' : '#6e6b7b',
                  justifyContent: 'center',
                }}>
                  {item.icon}
                </ListItemIcon>
                {desktopOpen && (
                  <ListItemText 
                    primary={item.text} 
                    sx={{
                      '& .MuiTypography-root': {
                        fontWeight: location.pathname === item.path ? 600 : 500,
                        fontSize: '0.9rem',
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: desktopOpen ? drawerWidth : collapsedDrawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: '#f8f9fa',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="persistent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: desktopOpen ? drawerWidth : collapsedDrawerWidth,
              backgroundColor: '#f8f9fa',
              transition: 'width 0.3s ease',
              borderRight: '1px solid #e0e0e0',
            },
          }}
          open={true} // Siempre abierto, pero con ancho variable
        >
          {drawer}
        </Drawer>
      </Box>
      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: desktopOpen ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${collapsedDrawerWidth}px)` },
          transition: 'width 0.3s ease',
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
        }}
      >
        {/* Header superior con barra de clínica */}
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: { md: desktopOpen ? drawerWidth : collapsedDrawerWidth },
          right: 0,
          zIndex: 1200,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'left 0.3s ease',
        }}>
          {/* Lado izquierdo: Botón hamburguesa y barra de clínica */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                backgroundColor: '#f0f0f0',
                color: '#3e4954',
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
            
            <Box sx={{ 
              backgroundColor: '#f8f9fa',
              borderRadius: 3,
              px: 2,
              py: 0.5,
              border: '1px solid #e0e0e0',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}>
              <BieniMedicoLogo size={20} color="#20c997" />
              <Typography variant="body2" sx={{ 
                color: '#6e6b7b',
                fontWeight: 500,
                fontSize: '0.875rem',
              }}>
                BieniMedico
              </Typography>
            </Box>
          </Box>

          {/* Lado derecho: Notificaciones */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              sx={{ 
                width: 40,
                height: 40,
                backgroundColor: '#7367f0',
                color: '#ffffff',
                '&:hover': { backgroundColor: '#5a52d5' },
                position: 'relative',
              }}
            >
              <Notifications sx={{ fontSize: 20 }} />
              <Box sx={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#55bcba',
                border: '2px solid #ffffff',
              }} />
            </IconButton>
          </Box>
        </Box>
        
        {/* Contenido de la página */}
        <Box sx={{ pt: 10, px: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;


