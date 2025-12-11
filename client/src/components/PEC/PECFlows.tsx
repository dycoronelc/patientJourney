import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import {
  Assignment,
  LocalHospital,
  Science,
  LocalPharmacy,
  People,
  Psychology,
  Restaurant,
  Work,
  Person,
} from '@mui/icons-material';

interface FlowStep {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  roles?: string[];
  details?: string[];
}

const PECFlows: React.FC = () => {
  const flowSteps: FlowStep[] = [
    {
      id: 1,
      name: 'REGES',
      description: 'Registro y agendamiento de citas',
      icon: <Assignment />,
      roles: ['Personal de REGES'],
      details: [
        'Agendar las citas de los pacientes según corresponda su control con el médico',
        'Programar siguiente cita según indicación médica',
      ],
    },
    {
      id: 2,
      name: 'Atención al Asegurado',
      description: 'Identificación y orientación del paciente',
      icon: <People />,
      roles: ['Personal de Atención al Asegurado'],
      details: [
        'Identificar al paciente del PEC',
        'Orientarlo a los diferentes departamentos mencionados en el flujograma',
      ],
    },
    {
      id: 3,
      name: 'Laboratorio',
      description: 'Toma de muestras y análisis',
      icon: <Science />,
      roles: ['Personal de Laboratorio'],
      details: [
        'Tomar muestra de sangre al paciente a las 8 am del día de la cita',
        'Procesar el mismo día de la cita para su control con el médico asignado',
        'Laboratorios solicitados: BHC, glicemia, HbA1c, creatinina con TFG, nitrógeno de urea, ácido úrico y urinálisis con relación albumina/creatinina en orina',
      ],
    },
    {
      id: 4,
      name: 'Enfermería',
      description: 'Evaluación primaria y educación del paciente',
      icon: <LocalHospital />,
      roles: ['Personal de Enfermería del Programa de Enfermedades Crónicas'],
      details: [
        'Evaluación primaria de historia clínica, signos vitales, peso y talla',
        'Proceso de educación personalizada con miras a mejorar la adherencia al tratamiento',
        'Revisión de antecedentes patológicos personales',
        'Medición de perímetro abdominal, peso, talla, IMC',
        'Medición de presión arterial y FC',
        'Revisión y exploración de los pies (si es diabético)',
        'Evaluación de zonas de punción si utiliza tratamiento con insulina',
        'Búsqueda de signos y síntomas de hiperglicemia e hipertensión prolongada',
        'Revisión de exámenes de laboratorios',
        'Educación del paciente y su familia sobre la enfermedad y su tratamiento',
        'Revisión de tarjeta de vacunación',
      ],
    },
    {
      id: 5,
      name: 'Referencias Multidisciplinarias',
      description: 'Evaluación integral según necesidad del paciente',
      icon: <People />,
      roles: ['Trabajo Social', 'Salud Mental', 'Nutrición'],
      details: [
        'La enfermera del programa referirá al paciente según la necesidad actual',
        'Mantener la atención el mismo día de la evaluación',
      ],
    },
    {
      id: 6,
      name: 'Atención Médica',
      description: 'Consulta y evaluación con el médico',
      icon: <Person />,
      roles: ['Médico del Equipo PEC'],
      details: [
        'Una vez listos los resultados de laboratorios, el paciente asistirá a la evaluación con el médico',
        'Proporcionar acceso fácil a la atención integral y continua',
        'Identificar y resolver problemas de salud de manera puntual',
        'Atender al individuo en el contexto de la familia',
        'Proporcionar coordinación de diferentes especialistas y tratamientos de apoyo',
        '15 pacientes por día (5 días a la semana)',
      ],
    },
    {
      id: 7,
      name: 'Farmacia',
      description: 'Dispensación de medicamentos',
      icon: <LocalPharmacy />,
      roles: ['Personal de Farmacia'],
      details: [
        'Proporcionar los medicamentos indicados por el médico',
      ],
    },
    {
      id: 8,
      name: 'REGES (Programación)',
      description: 'Programación de siguiente cita',
      icon: <Assignment />,
      roles: ['Personal de REGES'],
      details: [
        'Programar próxima cita según indicación médica',
      ],
    },
  ];

  const specialtyRoles = [
    {
      name: 'Trabajo Social',
      icon: <Work />,
      functions: [
        'Realizar evaluación social del paciente y de su entorno familiar',
        'Conocer dinámica y roles dentro del sistema para el afrontamiento de la enfermedad',
        'Evaluar el cumplimiento de los controles de salud y adherencia a tratamiento',
        'Participar en actividades de prevención, promoción de la salud y atención de comorbilidades',
        'Intervenir en el proceso de educación del paciente y de sus familiares',
        'Identificar factores y situaciones de riesgo social',
        'Realizar el estudio y elaborar el plan de intervención social',
        'Facilitar comunicación y coordinación con el Sistema de Servicios Sociales',
        'Asesorar a la persona enferma y la familia ofreciendo orientación y apoyo psicosocial',
      ],
    },
    {
      name: 'Salud Mental',
      icon: <Psychology />,
      functions: [
        'Fortalecer la salud mental de los pacientes con enfermedades crónicas y de sus familiares',
        'Identificar problemas relacionados a la salud mental',
        'Realizar evaluaciones de salud mental, ofrecer apoyo y coordinar con servicios de Psiquiatría o Psicología',
      ],
    },
    {
      name: 'Nutrición',
      icon: <Restaurant />,
      functions: [
        'Conocer el estado nutricional general de los pacientes',
        'Elaborar informes y planes de nutrición adecuados a cada paciente',
        'Planificar y desarrollar actividades para mejorar la nutrición y salud alimentaria',
        'Elaborar valoraciones nutricionales',
        'Realizar seguimientos dietéticos y nutricionales de pacientes',
        'Desarrollar protocolos de intervención alimentaria para grupos específicos',
      ],
    },
  ];

  return (
    <Box>
      
      {/* Flujograma principal */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Pasos del Flujograma
          </Typography>
          <Stepper orientation="vertical">
            {flowSteps.map((step, index) => (
              <Step key={step.id} active={true} completed={false}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: '#7367f0',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {step.icon}
                    </Box>
                  )}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {step.name}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body1" paragraph>
                    {step.description}
                  </Typography>
                  {step.roles && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Roles:
                      </Typography>
                      {step.roles.map((role, idx) => (
                        <Chip
                          key={idx}
                          label={role}
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  )}
                  {step.details && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Detalles:
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        {step.details.map((detail, idx) => (
                          <li key={idx}>
                            <Typography variant="body2" color="textSecondary">
                              {detail}
                            </Typography>
                          </li>
                        ))}
                      </Box>
                    </Box>
                  )}
                  {index < flowSteps.length - 1 && (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        my: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 2,
                          height: 30,
                          backgroundColor: '#7367f0',
                        }}
                      />
                    </Box>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Roles especializados */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Roles Especializados en Referencias Multidisciplinarias
      </Typography>
      <Grid container spacing={3}>
        {specialtyRoles.map((specialty, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: '#7367f0',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {specialty.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {specialty.name}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {specialty.functions.map((func, idx) => (
                    <li key={idx}>
                      <Typography variant="body2" color="textSecondary">
                        {func}
                      </Typography>
                    </li>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Información adicional */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Proceso de Selección de Pacientes (Pacientes Incidentes)
          </Typography>
          <Box component="ol" sx={{ pl: 2, m: 0 }}>
            <li>
              <Typography variant="body2" color="textSecondary" paragraph>
                Selección de pacientes según listado de la base de datos con los valores de laboratorio fuera de rango, por orden de prioridad.
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="textSecondary" paragraph>
                Se realizará llamada por un personal médico junto con un personal de REGES para explicarle al paciente en qué consiste el programa, y si éste acepta participar, se le agendará una cita. Al momento de la llamada se confirmarán todos los datos del paciente (nombre completo, cédula, edad, fecha de nacimiento, número de celular propio y uno alterno).
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="textSecondary" paragraph>
                El personal médico se encargará de llenar las solicitudes de laboratorio de los pacientes agendados y proporcionarle al laboratorio la lista semanal de los pacientes agendados junto con las solicitudes de laboratorio firmadas y selladas.
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PECFlows;

