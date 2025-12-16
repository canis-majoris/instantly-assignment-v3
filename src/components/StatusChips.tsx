/**
 * Status Chips Component
 * Display email status badges
 */

'use client';

import React from 'react';
import { Box, Chip } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { Email, EmailDirection } from '@/types';

interface StatusChipsProps {
  email: Pick<Email, 'isRead' | 'isImportant' | 'direction'>;
  size?: 'small' | 'medium';
}

export const StatusChips: React.FC<StatusChipsProps> = ({ email, size = 'small' }) => {
  const chipSx = size === 'small' ? { fontSize: '0.65rem', height: 20 } : {};

  return (
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {email.direction === EmailDirection.OUTGOING && (
        <Chip
          icon={<SendIcon sx={{ fontSize: '0.75rem !important' }} />}
          label="Sent"
          size={size}
          color="info"
          variant="outlined"
          sx={{ ...chipSx, paddingLeft: 0.5 }}
        />
      )}
      {!email.isRead && (
        <Chip label="Unread" size={size} color="warning" variant="outlined" sx={chipSx} />
      )}
      {email.isImportant && (
        <Chip label="Important" size={size} color="secondary" variant="outlined" sx={chipSx} />
      )}
    </Box>
  );
};

export default StatusChips;
