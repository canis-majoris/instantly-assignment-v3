/**
 * Email Avatar Component
 * Consistent avatar styling across the app
 */

'use client';

import React from 'react';
import { Avatar } from '@mui/material';
import { Email } from '@/types';
import { getInitials } from '@/lib/utils';

interface EmailAvatarProps {
  email: Pick<Email, 'from' | 'isImportant'>;
  size?: 'small' | 'medium' | 'large';
}

const AVATAR_SIZES = {
  small: { width: 32, height: 32, fontSize: '0.75rem' },
  medium: { width: 36, height: 36, fontSize: '0.875rem' },
  large: { width: 48, height: 48, fontSize: '1rem' },
};

export const EmailAvatar: React.FC<EmailAvatarProps> = ({ email, size = 'medium' }) => {
  const sizeStyles = AVATAR_SIZES[size];
  return (
    <Avatar
      sx={{
        bgcolor: email.isImportant ? 'warning.main' : 'primary.main',
        fontWeight: 600,
        ...sizeStyles,
      }}
    >
      {getInitials(email.from)}
    </Avatar>
  );
};

export default EmailAvatar;
