import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Paper,
  FormControlLabel,
  Checkbox,
  Link,
  IconButton,
} from '@mui/material';
import {
  LocalHospital,
  Person,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    username: 'daniel.coronel@maxialatam.com',
    password: 'password123',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.login(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f5fa 0%, #e0e0eb 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '30%',
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23e0e0eb" fill-opacity="0.3"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.1,
        },
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backgroundColor: '#ffffff',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo y Título */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: '#20c997',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <LocalHospital sx={{ color: '#ffffff', fontSize: 32 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#3e4954', mb: 1 }}>
              Bienvenido a Bieni Médico
            </Typography>
            <Typography variant="body1" sx={{ color: '#6e6b7b', textAlign: 'center' }}>
              Todos tus registros médicos en un solo lugar.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {/* Campo Email */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#3e4954', mb: 1, fontWeight: 500 }}>
                Email
              </Typography>
              <TextField
                fullWidth
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="daniel.coronel@maxialatam.com"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#ffffff',
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#7367f0',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#7367f0',
                    },
                  },
                }}
              />
            </Box>

            {/* Campo Contraseña */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#3e4954', mb: 1, fontWeight: 500 }}>
                Contraseña
              </Typography>
              <TextField
                fullWidth
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="........"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#ffffff',
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#7367f0',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#7367f0',
                    },
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      sx={{
                        backgroundColor: '#7367f0',
                        color: '#ffffff',
                        '&:hover': {
                          backgroundColor: '#5a52d5',
                        },
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            </Box>

            {/* Links y Checkbox */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{
                      color: '#7367f0',
                      '&.Mui-checked': {
                        color: '#7367f0',
                      },
                    }}
                  />
                }
                label="Recordarme"
                sx={{ color: '#3e4954' }}
              />
              <Link
                href="#"
                sx={{
                  color: '#7367f0',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Olvidé mi contraseña
              </Link>
            </Box>

            {/* Botón de Login */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: '#7367f0',
                color: '#ffffff',
                borderRadius: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#5a52d5',
                },
                '&:disabled': {
                  backgroundColor: '#e0e0e0',
                  color: '#9e9e9e',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
            </Button>
          </Box>

          {/* Separador */}
          <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
            <Box sx={{ flexGrow: 1, height: 1, backgroundColor: '#e0e0e0' }} />
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#e0e0e0',
                mx: 2,
              }}
            />
            <Box sx={{ flexGrow: 1, height: 1, backgroundColor: '#e0e0e0' }} />
          </Box>

          {/* Footer */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#3e4954' }}>
              ¿Aún no utilizas BieniMédico?{' '}
              <Link
                href="#"
                sx={{
                  color: '#7367f0',
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Contáctanos
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;












