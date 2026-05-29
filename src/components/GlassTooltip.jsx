import React from 'react';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

const GlassTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: 'rgba(20, 25, 35, 0.8)', // Deep modern background for the glass theme
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    color: '#f8fafc',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    fontSize: '0.85rem',
    fontWeight: 500,
    padding: '8px 12px',
    borderRadius: '8px',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: 'rgba(20, 25, 35, 0.8)',
    '&::before': {
      border: '1px solid rgba(255, 255, 255, 0.15)',
      boxSizing: 'border-box',
    },
  },
}));

export default GlassTooltip;
