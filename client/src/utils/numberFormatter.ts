/**
 * Formatea números con separador de miles (coma) y decimales (punto)
 * Formato: 1,234.56
 */

export const formatNumber = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return '0';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '0';
  }
  
  // Formatear con separador de miles (coma) y decimales (punto)
  return numValue.toLocaleString('es-PA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

/**
 * Formatea montos en dólares con separador de miles y decimales
 * Formato: $1,234.56
 */
export const formatCurrency = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return '$0.00';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '$0.00';
  }
  
  // Formatear con símbolo de dólar ($), separador de miles (coma) y decimales (punto)
  return `$${numValue.toLocaleString('es-PA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Formatea porcentajes con separador de miles y decimales
 * Formato: 95.50%
 */
export const formatPercentage = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return '0%';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '0%';
  }
  
  // Formatear porcentaje con separador de miles y decimales
  return `${numValue.toLocaleString('es-PA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
};

/**
 * Formatea tiempo en minutos
 * Formato: 120 min
 */
export const formatDuration = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return '0 min';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '0 min';
  }
  
  return `${formatNumber(numValue)} min`;
};

/**
 * Formatea fechas en formato corto
 * Formato: 23 oct, 12:17 p.m.
 */
export const formatShortDate = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return 'N/A';
  }
  
  try {
    const date = new Date(dateString);
    
    // Meses en español (abreviados)
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Formato 12 horas con p.m./a.m.
    const period = hours >= 12 ? 'p.m.' : 'a.m.';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${day} ${month}, ${displayHours}:${displayMinutes} ${period}`;
  } catch (error) {
    return 'N/A';
  }
};

