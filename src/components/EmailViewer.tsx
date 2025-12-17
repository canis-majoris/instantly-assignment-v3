/**
 * Email Viewer Component
 * Displays the full content of a selected email
 */

'use client';

import React from 'react';
import { Box, Typography, Divider, Paper } from '@mui/material';
import { Email } from '@/types';
import { EmailAvatar } from './EmailAvatar';
import { StatusChips } from './StatusChips';
import { EmailToolbarActions } from './EmailToolbarActions';
import { ViewerToolbar } from './ViewerToolbar';
import { getDisplayName, formatFullDate } from '@/lib/utils';

interface EmailViewerProps {
  email: Email;
  onClose: () => void;
  onDelete: (emailId: number) => void;
  onToggleImportant: (emailId: number) => void;
  onReply?: (email: Email) => void;
  onRestore?: (emailId: number) => void;
  isTrash?: boolean;
}

const EmailViewer: React.FC<EmailViewerProps> = ({
  email,
  onClose,
  onDelete,
  onToggleImportant,
  onReply,
  onRestore,
  isTrash = false,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'background.paper',
      }}
      data-testid="email-viewer"
    >
      {/* Toolbar */}
      <ViewerToolbar onClose={onClose}>
        <EmailToolbarActions
          email={email}
          onToggleImportant={() => onToggleImportant(email.id)}
          onDelete={() => onDelete(email.id)}
          onRestore={onRestore ? () => onRestore(email.id) : undefined}
          onReply={onReply ? () => onReply(email) : undefined}
          isTrash={isTrash}
        />
      </ViewerToolbar>

      {/* Email Header */}
      <Box sx={{ p: 3 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}
          data-testid="email-viewer-subject"
        >
          {email.subject}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <EmailAvatar email={email} size="large" />

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {getDisplayName(email.from)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                &lt;{email.from}&gt;
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary">
              To: {email.to}
            </Typography>

            {email.cc && (
              <Typography variant="body2" color="text.secondary">
                Cc: {email.cc}
              </Typography>
            )}

            {email.bcc && (
              <Typography variant="body2" color="text.secondary">
                Bcc: {email.bcc}
              </Typography>
            )}

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {formatFullDate(email.createdAt)}
            </Typography>
          </Box>

          <StatusChips email={email} />
        </Box>
      </Box>

      <Divider />

      {/* Email Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: 'background.default',
            borderRadius: 2,
            minHeight: 200,
          }}
        >
          <Typography
            variant="body1"
            sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: 'text.primary' }}
            data-testid="email-viewer-content"
          >
            {email.content || 'No content'}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default EmailViewer;
