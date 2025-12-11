// Servicio para manejar datos del módulo PEC (Programa de Educación al Paciente)

export interface PatientData {
  patient_id: number;
  gender: 'M' | 'F';
  age_group: string;
  diabetes_tag: 'no data' | 'no diabetes' | 'prediabetes' | 'diabetes type 2';
}

export interface HospitalData {
  UnidadEjecutora: string;
  Condicion: 'Diabetes' | 'Normal' | 'Prediabetes';
  TotalCasos: number;
  CasosM: number;
  CasosF: number;
  'Casos-18': number;
  'Casos18-30': number;
  'Casos31-40': number;
  'Casos41-50': number;
  'Casos51-60': number;
  'Casos61-70': number;
  'Casos+70': number;
  Lat: number;
  Long: number;
}

export interface PECDashboardStats {
  totalPatients: number;
  patientsWithDiabetes: number;
  patientsWithPrediabetes: number;
  patientsNormal: number;
  patientsNoData: number;
  byGender: {
    male: number;
    female: number;
  };
  byAgeGroup: {
    '18-39': number;
    '40-59': number;
    '60-79': number;
    '80+': number;
  };
  byHospital: Array<{
    hospital: string;
    diabetes: number;
    prediabetes: number;
    normal: number;
    total: number;
    lat: number;
    long: number;
  }>;
}

// Función para parsear CSV (maneja valores con comas dentro de comillas)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Función para parsear CSV
function parseCSV<T>(csvText: string, headers: string[]): T[] {
  const lines = csvText.trim().split('\n');
  const data: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const obj: any = {};

    headers.forEach((header, index) => {
      let value = values[index]?.trim() || '';
      // Remover comillas si existen
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      // Intentar convertir a número si es posible
      const numValue = Number(value);
      obj[header] = isNaN(numValue) || value === '' ? value : numValue;
    });

    data.push(obj as T);
  }

  return data;
}

// Cache para los datos
let patientDataCache: PatientData[] | null = null;
let hospitalDataCache: HospitalData[] | null = null;

export const pecService = {
  // Cargar datos de pacientes
  async loadPatientData(): Promise<PatientData[]> {
    if (patientDataCache) {
      return patientDataCache;
    }

    try {
      const response = await fetch('/diabetes_dataset_1.csv');
      if (!response.ok) {
        throw new Error('Error al cargar datos de pacientes');
      }
      const csvText = await response.text();
      patientDataCache = parseCSV<PatientData>(csvText, [
        'patient_id',
        'gender',
        'age_group',
        'diabetes_tag',
      ]);
      return patientDataCache;
    } catch (error) {
      console.error('Error al cargar datos de pacientes:', error);
      return [];
    }
  },

  // Cargar datos de hospitales
  async loadHospitalData(): Promise<HospitalData[]> {
    if (hospitalDataCache) {
      return hospitalDataCache;
    }

    try {
      const response = await fetch('/diabetes_dataset_2.csv');
      if (!response.ok) {
        throw new Error('Error al cargar datos de hospitales');
      }
      const csvText = await response.text();
      hospitalDataCache = parseCSV<HospitalData>(csvText, [
        'UnidadEjecutora',
        'Condicion',
        'TotalCasos',
        'CasosM',
        'CasosF',
        'Casos-18',
        'Casos18-30',
        'Casos31-40',
        'Casos41-50',
        'Casos51-60',
        'Casos61-70',
        'Casos+70',
        'Lat',
        'Long',
      ]);
      return hospitalDataCache;
    } catch (error) {
      console.error('Error al cargar datos de hospitales:', error);
      return [];
    }
  },

  // Obtener estadísticas del dashboard
  async getDashboardStats(): Promise<PECDashboardStats> {
    const [patients, hospitals] = await Promise.all([
      this.loadPatientData(),
      this.loadHospitalData(),
    ]);

    // Estadísticas de pacientes
    const totalPatients = patients.length;
    const patientsWithDiabetes = patients.filter(
      (p) => p.diabetes_tag === 'diabetes type 2'
    ).length;
    const patientsWithPrediabetes = patients.filter(
      (p) => p.diabetes_tag === 'prediabetes'
    ).length;
    const patientsNormal = patients.filter(
      (p) => p.diabetes_tag === 'no diabetes'
    ).length;
    const patientsNoData = patients.filter(
      (p) => p.diabetes_tag === 'no data'
    ).length;

    // Por género
    const byGender = {
      male: patients.filter((p) => p.gender === 'M').length,
      female: patients.filter((p) => p.gender === 'F').length,
    };

    // Por grupo de edad
    const byAgeGroup = {
      '18-39': patients.filter((p) => p.age_group === '18-39').length,
      '40-59': patients.filter((p) => p.age_group === '40-59').length,
      '60-79': patients.filter((p) => p.age_group === '60-79').length,
      '80+': patients.filter((p) => {
        const age = p.age_group;
        return age && (age.includes('80') || parseInt(age) >= 80);
      }).length,
    };

    // Por hospital
    const hospitalMap = new Map<string, any>();
    hospitals.forEach((h) => {
      if (!hospitalMap.has(h.UnidadEjecutora)) {
        hospitalMap.set(h.UnidadEjecutora, {
          hospital: h.UnidadEjecutora,
          diabetes: 0,
          prediabetes: 0,
          normal: 0,
          total: 0,
          lat: h.Lat,
          long: h.Long,
        });
      }
      const hospital = hospitalMap.get(h.UnidadEjecutora)!;
      if (h.Condicion === 'Diabetes') {
        hospital.diabetes = h.TotalCasos;
      } else if (h.Condicion === 'Prediabetes') {
        hospital.prediabetes = h.TotalCasos;
      } else if (h.Condicion === 'Normal') {
        hospital.normal = h.TotalCasos;
      }
      hospital.total += h.TotalCasos;
    });

    const byHospital = Array.from(hospitalMap.values());

    return {
      totalPatients,
      patientsWithDiabetes,
      patientsWithPrediabetes,
      patientsNormal,
      patientsNoData,
      byGender,
      byAgeGroup,
      byHospital,
    };
  },
};

