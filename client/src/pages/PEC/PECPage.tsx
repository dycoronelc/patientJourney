import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Dashboard,
  Timeline,
  AccountTree,
} from '@mui/icons-material';

// Componentes
import PECDashboard from '../../components/PEC/PECDashboard';
import PECFlows from '../../components/PEC/PECFlows';
import PECFlowDiagram from '../../components/PEC/PECFlowDiagram';

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
      id={`pec-tabpanel-${index}`}
      aria-labelledby={`pec-tab-${index}`}
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

const PECPage: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Centro Nacional de Prevención de Enfermedades Crónicas (CNEC)
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Gestión y seguimiento de pacientes - Diabetes
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="PEC tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            icon={<Dashboard />}
            label="Dashboard"
            id="pec-tab-0"
            aria-controls="pec-tabpanel-0"
          />
          <Tab
            icon={<AccountTree />}
            label="Diagrama de Flujo"
            id="pec-tab-2"
            aria-controls="pec-tabpanel-2"
          />
          <Tab
            icon={<Timeline />}
            label="Flujos de Atención"
            id="pec-tab-1"
            aria-controls="pec-tabpanel-1"
          />
        </Tabs>
      </Paper>

      <TabPanel value={value} index={0}>
        <PECDashboard />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <PECFlows />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <PECFlowDiagram />
      </TabPanel>
    </Box>
  );
};

export default PECPage;

