/**
 * Email List Component
 * Displays a scrollable list of email cards
 */

'use client';

import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
import EmailCard from './EmailCard';
import EmailListSkeleton from './EmailListSkeleton';
import { Email } from '@/types';
import { useMinDuration } from '@/hooks';

/** Minimum time to show skeleton to prevent flashing (ms) */
const MIN_SKELETON_DISPLAY_MS = 300;

interface EmailListProps {
  emails: Email[];
  selectedEmailId: number | null;
  onEmailSelect: (email: Email) => void;
  isLoading?: boolean;
  isPending?: boolean;
  error?: string | null;
}

const EmailList: React.FC<EmailListProps> = ({
  emails,
  selectedEmailId,
  onEmailSelect,
  isLoading = false,
  isPending = false,
  error = null,
}) => {
  const showSkeleton = useMinDuration(isLoading, MIN_SKELETON_DISPLAY_MS);

  if (showSkeleton) {
    return <EmailListSkeleton count={5} />;
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (emails.length === 0) {
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
        data-testid="email-list-empty"
      >
        <EmailIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No emails found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your search or filters
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        p: 1,
        // Show subtle opacity change during transition (React 19 useTransition)
        opacity: isPending ? 0.7 : 1,
        transition: 'opacity 0.15s ease-in-out',
      }}
      data-testid="email-list"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {emails.map((email) => (
          <EmailCard
            key={email.id}
            email={email}
            isSelected={email.id === selectedEmailId}
            onClick={() => onEmailSelect(email)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default EmailList;
