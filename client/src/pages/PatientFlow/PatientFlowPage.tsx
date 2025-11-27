import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Timeline,
  AttachMoney,
  AccountTree,
  Assessment,
} from '@mui/icons-material';

// Componentes
import PatientFlowDiagram from '../../components/PatientFlow/PatientFlowDiagram';
import CostAnalysisPanel from '../../components/Costs/CostAnalysisPanel';
import CostCalculator from '../../components/Costs/CostCalculator';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`flow-tabpanel-${index}`}
      aria-labelledby={`flow-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PatientFlowPage: React.FC = () => {
  const [value, setValue] = useState(0);
  const [editMode, setEditMode] = useState(false);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleEditFlow = () => {
    setEditMode(true);
  };

  const handleCloseEdit = () => {
    setEditMode(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Flujos de Pacientes y Análisis de Costos
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Visualiza el recorrido completo del paciente, analiza costos y genera proyecciones financieras.
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="flujos y costos tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            icon={<Timeline />}
            label="Diagrama de Flujo"
            id="flow-tab-0"
            aria-controls="flow-tabpanel-0"
          />
          <Tab
            icon={<AttachMoney />}
            label="Análisis de Costos"
            id="flow-tab-1"
            aria-controls="flow-tabpanel-1"
          />
          <Tab
            icon={<AccountTree />}
            label="Calculadora de Costos"
            id="flow-tab-2"
            aria-controls="flow-tabpanel-2"
          />
        </Tabs>
      </Paper>

      <TabPanel value={value} index={0}>
        <PatientFlowDiagram onEditFlow={handleEditFlow} />
      </TabPanel>
      
      <TabPanel value={value} index={1}>
        <CostAnalysisPanel />
      </TabPanel>
      
      <TabPanel value={value} index={2}>
        <CostCalculator />
      </TabPanel>
    </Box>
  );
};

export default PatientFlowPage;
