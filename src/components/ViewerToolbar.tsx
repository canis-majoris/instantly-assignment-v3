/**
 * Viewer Toolbar Component
 * Shared toolbar layout for email/conversation viewers
 */

'use client';

import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

interface ViewerToolbarProps {
  onClose: () => void;
  children?: React.ReactNode;
}

export const ViewerToolbar: React.FC<ViewerToolbarProps> = ({ onClose, children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 2,
        borderBottom: '1px solid',
        borderBottomColor: 'divider',
      }}
    >
      <Tooltip title="Back to list">
        <IconButton onClick={onClose} size="small" data-testid="back-button">
          <ArrowBackIcon />
        </IconButton>
      </Tooltip>
      <Box sx={{ flex: 1 }} />
      {children}
    </Box>
  );
};

export default ViewerToolbar;
