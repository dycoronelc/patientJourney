import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
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
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  LocalHospital,
  CheckCircle,
} from '@mui/icons-material';
import { medicalFlowService, Specialty as ApiSpecialty } from '../../../services/medicalFlowService';
import toast from 'react-hot-toast';

interface Specialty {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

const SpecialtiesConfig: React.FC = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [formData, setFormData] = useState<Partial<Specialty>>({});

  // Cargar especialidades desde la API
  useEffect(() => {
    loadSpecialties();
  }, []);

  const loadSpecialties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await medicalFlowService.getSpecialties();
      
      // Convertir el formato de la API al formato del componente
      const formattedData: Specialty[] = data.map((spec: ApiSpecialty) => ({
        id: spec.id,
        code: spec.code,
        name: spec.name,
        isActive: spec.isActive,
      }));
      
      setSpecialties(formattedData);
      console.log(`✅ Cargadas ${formattedData.length} especialidades`);
    } catch (err) {
      console.error('Error loading specialties:', err);
      setError('Error al cargar las especialidades');
      toast.error('Error al cargar las especialidades');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (specialty?: Specialty) => {
    if (specialty) {
      setEditingSpecialty(specialty);
      setFormData(specialty);
    } else {
      setEditingSpecialty(null);
      setFormData({});
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingSpecialty(null);
    setFormData({});
  };

  const handleSave = () => {
    // TODO: Implementar guardado de especialidades
    toast('Funcionalidad de guardado en desarrollo', {
      icon: 'ℹ️',
    });
    handleClose();
  };

  const handleDelete = (id: string) => {
    // TODO: Implementar eliminación de especialidades
    toast('Funcionalidad de eliminación no disponible', {
      icon: '⚠️',
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6">
            Gestión de Especialidades Médicas
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {loading ? 'Cargando...' : `${specialties.length} especialidades disponibles`}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
          disabled={loading}
        >
          Nueva Especialidad
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {specialties.map((specialty) => (
                <TableRow key={specialty.id}>
                  <TableCell>
                    <Chip 
                      label={specialty.code} 
                      size="small" 
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocalHospital sx={{ mr: 1, color: 'primary.main' }} />
                      {specialty.name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {specialty.isActive ? (
                      <Chip 
                        icon={<CheckCircle />}
                        label="Activo" 
                        size="small" 
                        color="success"
                      />
                    ) : (
                      <Chip 
                        label="Inactivo" 
                        size="small" 
                        color="default"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(specialty)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(specialty.id)} disabled>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSpecialty ? 'Editar Especialidad' : 'Nueva Especialidad'}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Funcionalidad de edición/creación de especialidades en desarrollo
          </Alert>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Código"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            {editingSpecialty ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SpecialtiesConfig;










