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
  Chip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Business,
} from '@mui/icons-material';

interface HealthCenter {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  country: string;
  specialties: string[];
  capacity: {
    beds?: number;
    doctors: number;
    nurses: number;
  };
}

const HealthCentersConfig: React.FC = () => {
  const [centers, setCenters] = useState<HealthCenter[]>([]);
  const [open, setOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<HealthCenter | null>(null);
  const [formData, setFormData] = useState<Partial<HealthCenter>>({});

  // Datos de ejemplo
  useEffect(() => {
    const exampleCenters: HealthCenter[] = [
      {
        id: '1',
        name: 'Hospital General Central',
        type: 'hospital',
        address: 'Av. Principal 123',
        city: 'Ciudad Capital',
        country: 'País',
        specialties: ['Cardiología', 'Endocrinología', 'Geriatría'],
        capacity: {
          beds: 500,
          doctors: 150,
          nurses: 300,
        },
      },
      {
        id: '2',
        name: 'Clínica San José',
        type: 'clinic',
        address: 'Calle Secundaria 456',
        city: 'Ciudad Capital',
        country: 'País',
        specialties: ['Cardiología', 'Medicina General'],
        capacity: {
          doctors: 25,
          nurses: 50,
        },
      },
    ];
    setCenters(exampleCenters);
  }, []);

  const handleOpen = (center?: HealthCenter) => {
    if (center) {
      setEditingCenter(center);
      setFormData(center);
    } else {
      setEditingCenter(null);
      setFormData({});
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCenter(null);
    setFormData({});
  };

  const handleSave = () => {
    if (editingCenter) {
      setCenters(centers.map(c => 
        c.id === editingCenter.id ? { ...c, ...formData } : c
      ));
    } else {
      const newCenter: HealthCenter = {
        id: Date.now().toString(),
        name: formData.name || '',
        type: formData.type || '',
        address: formData.address || '',
        city: formData.city || '',
        country: formData.country || '',
        specialties: formData.specialties || [],
        capacity: formData.capacity || { doctors: 0, nurses: 0 },
      };
      setCenters([...centers, newCenter]);
    }
    handleClose();
  };

  const handleDelete = (id: string) => {
    setCenters(centers.filter(c => c.id !== id));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hospital': return 'primary';
      case 'clinic': return 'secondary';
      case 'policlinic': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Gestión de Centros de Salud
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Nuevo Centro
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Ubicación</TableCell>
              <TableCell>Especialidades</TableCell>
              <TableCell>Capacidad</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {centers.map((center) => (
              <TableRow key={center.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Business sx={{ mr: 1, color: 'primary.main' }} />
                    {center.name}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={center.type}
                    color={getTypeColor(center.type) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{center.city}, {center.country}</TableCell>
                <TableCell>
                  {center.specialties.slice(0, 2).join(', ')}
                  {center.specialties.length > 2 && ` +${center.specialties.length - 2}`}
                </TableCell>
                <TableCell>
                  {center.capacity.doctors} doctores, {center.capacity.nurses} enfermeras
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(center)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(center.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCenter ? 'Editar Centro de Salud' : 'Nuevo Centro de Salud'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tipo"
                select
                value={formData.type || ''}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="hospital">Hospital</option>
                <option value="clinic">Clínica</option>
                <option value="policlinic">Policlínica</option>
                <option value="health_center">Centro de Salud</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ciudad"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="País"
                value={formData.country || ''}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">
            {editingCenter ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HealthCentersConfig;










