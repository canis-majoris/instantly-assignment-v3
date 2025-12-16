/**
 * Email List Skeleton Component
 * Loading placeholder for email list with animated skeleton cards
 */

'use client';

import React from 'react';
import { Box, Skeleton } from '@mui/material';

interface EmailListSkeletonProps {
  count?: number;
}

/**
 * Single skeleton card matching EmailCard dimensions
 */
function EmailCardSkeleton() {
  return (
    <Box
      sx={{
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        p: 1.5,
      }}
    >
      {/* Header with Avatar */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
        <Skeleton variant="circular" width={32} height={32} animation="wave" />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Subject line */}
          <Skeleton variant="text" width="70%" height={20} animation="wave" sx={{ mb: 0.5 }} />
          {/* From email */}
          <Skeleton variant="text" width="50%" height={16} animation="wave" />
        </Box>
        {/* Date */}
        <Skeleton variant="text" width={60} height={14} animation="wave" />
      </Box>

      {/* Preview text */}
      <Skeleton variant="text" width="85%" height={18} animation="wave" sx={{ ml: 5.5 }} />
      <Skeleton variant="text" width="85%" height={18} animation="wave" sx={{ ml: 5.5 }} />
    </Box>
  );
}

/**
 * Email list skeleton showing multiple loading cards
 */
const EmailListSkeleton: React.FC<EmailListSkeletonProps> = ({ count = 8 }) => {
  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'hidden',
        p: 1,
      }}
      data-testid="email-list-skeleton"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {Array.from({ length: count }).map((_, index) => (
          <EmailCardSkeleton key={index} />
        ))}
      </Box>
    </Box>
  );
};

export default EmailListSkeleton;
