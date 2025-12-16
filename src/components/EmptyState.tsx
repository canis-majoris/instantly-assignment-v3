/**
 * Empty State Component
 * Reusable empty state display
 */

'use client';

import React from 'react';
import { Box } from '@mui/material';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        p: 4,
        textAlign: 'center',
      }}
    >
      <Box sx={{ color: 'text.secondary', mb: 2 }}>{icon}</Box>
      <Box sx={{ typography: 'h6', color: 'text.secondary' }}>{title}</Box>
      {description && (
        <Box sx={{ typography: 'body2', color: 'text.secondary' }}>{description}</Box>
      )}
    </Box>
  );
};

export default EmptyState;
