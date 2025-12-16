/**
 * Email Card Component
 * Displays a compact preview of an email in the email list
 */

import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Star } from '@mui/icons-material';
import { Email } from '@/types';
import { EmailAvatar } from './EmailAvatar';
import { StatusChips } from './StatusChips';
import { formatCompactDate, truncateText } from '@/lib/utils';

interface EmailCardProps {
  email: Email;
  isSelected?: boolean;
  onClick?: () => void;
}

const EmailCard: React.FC<EmailCardProps> = ({ email, isSelected = false, onClick }) => {
  return (
    <Card
      data-testid={`email-card-${email.id}`}
      onClick={onClick}
      sx={{
        borderRadius: 1,
        boxShadow: isSelected ? 2 : email.isRead ? 0 : 1,
        border: '2px solid',
        borderColor: isSelected ? 'primary.main' : email.isRead ? 'divider' : 'primary.light',
        backgroundColor: isSelected
          ? 'action.selected'
          : email.isRead
            ? 'background.paper'
            : 'action.hover',
        transition: 'all 0.15s ease-in-out',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: isSelected ? 'action.selected' : 'action.hover',
          boxShadow: 2,
        },
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
          <EmailAvatar email={email} size="small" />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <Typography
                variant="subtitle2"
                data-testid={`email-subject-${email.id}`}
                sx={{
                  fontWeight: email.isRead ? 400 : 600,
                  color: email.isRead ? 'text.secondary' : 'text.primary',
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {email.subject}
              </Typography>
              {email.isImportant && <Star sx={{ color: 'warning.main', fontSize: '1rem' }} />}
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {email.from}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {formatCompactDate(email.createdAt)}
            </Typography>
            {!email.isRead && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                }}
              />
            )}
          </Box>
        </Box>

        {/* Content Preview */}
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: '0.75rem',
            lineHeight: 1.4,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            mb: 1,
          }}
        >
          {truncateText(email.content)}
        </Typography>

        {/* Status Chips */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <StatusChips email={email} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default EmailCard;
