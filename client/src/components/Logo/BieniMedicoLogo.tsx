import React from 'react';
import { Box } from '@mui/material';

interface BieniMedicoLogoProps {
  size?: number;
  color?: string;
}

const BieniMedicoLogo: React.FC<BieniMedicoLogoProps> = ({ 
  size = 24, 
  color = '#20c997' 
}) => {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src="/images/bienimedico-logo.png"
        alt="BieniMedico Logo"
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
        }}
        onError={(e) => {
          // Fallback a SVG si la imagen no se carga
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6C16 7.10457 15.1046 8 14 8H10C8.89543 8 8 7.10457 8 6V4Z" fill="${color}"/>
                <path d="M10 6H14V4H10V6Z" fill="white"/>
                <path d="M12 8V12" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
                <path d="M9 12H15" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
                <circle cx="9" cy="15" r="2" fill="${color}"/>
                <circle cx="15" cy="15" r="2" fill="${color}"/>
                <path d="M9 17V20" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
                <path d="M15 17V20" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
              </svg>
            `;
          }
        }}
      />
    </Box>
  );
};

export default BieniMedicoLogo;
