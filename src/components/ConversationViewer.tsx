/**
 * Conversation Viewer Component
 * Displays the full email thread/conversation when threading is enabled
 */

'use client';

import React from 'react';
import { Box, Typography, Chip, CircularProgress } from '@mui/material';
import { Email, EmailFilter } from '@/types';
import { useThreadQuery } from '@/hooks';
import { EmailToolbarActions } from './EmailToolbarActions';
import { ViewerToolbar } from './ViewerToolbar';
import EmailMessage from './EmailMessage';

interface ConversationViewerProps {
  /** The selected email (latest in thread when grouped) */
  email: Email;
  /** Whether threading/grouping is enabled */
  isThreaded: boolean;
  /** Current filter/view */
  filter?: EmailFilter;
  onClose: () => void;
  onDelete: (emailId: number, threadId?: string, filter?: EmailFilter) => void;
  onToggleImportant: (
    emailId: number,
    currentIsImportant?: boolean,
    singleEmailOnly?: boolean,
  ) => void;
  onReply?: (email: Email) => void;
  onRestore?: (emailId: number, threadId?: string) => void;
  isTrash?: boolean;
}

const ConversationViewer: React.FC<ConversationViewerProps> = ({
  email,
  isThreaded,
  filter,
  onClose,
  onDelete,
  onToggleImportant,
  onReply,
  onRestore,
  isTrash = false,
}) => {
  // Fetch emails in the thread, filtered by current view
  const {
    data: threadEmails = [],
    isLoading,
    isFetched,
  } = useThreadQuery({
    threadId: isThreaded ? email.threadId : null,
    enabled: isThreaded,
    filter,
  });

  // Use thread emails if available and fetched, otherwise just show the single email
  // Don't fall back to stale email prop if thread was fetched but is now empty
  const emailsToShow = isThreaded
    ? isFetched && threadEmails.length === 0
      ? []
      : threadEmails.length > 0
        ? threadEmails
        : [email]
    : [email];

  // If no emails to show (all were restored/deleted), close the viewer
  React.useEffect(() => {
    if (isThreaded && isFetched && emailsToShow.length === 0) {
      onClose();
    }
  }, [isThreaded, isFetched, emailsToShow.length, onClose]);

  const latestEmail = emailsToShow.length > 0 ? emailsToShow[emailsToShow.length - 1] : email;
  const messageCount = emailsToShow.length;

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
        {isThreaded && messageCount > 1 && (
          <Chip
            label={`${messageCount} messages`}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
        <EmailToolbarActions
          email={latestEmail}
          onToggleImportant={() => onToggleImportant(latestEmail.id, latestEmail.isImportant)}
          onDelete={() => onDelete(latestEmail.id, latestEmail.threadId, filter)}
          onRestore={onRestore ? () => onRestore(latestEmail.id, latestEmail.threadId) : undefined}
          onReply={onReply ? () => onReply(latestEmail) : undefined}
          isTrash={isTrash}
          deleteTooltip="Delete conversation"
          restoreTooltip="Restore conversation"
        />
      </ViewerToolbar>

      {/* Thread Subject */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderBottomColor: 'divider' }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, color: 'text.primary' }}
          data-testid="email-viewer-subject"
        >
          {email.subject}
        </Typography>
        {isThreaded && messageCount > 1 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Conversation with {messageCount} messages
          </Typography>
        )}
      </Box>

      {/* Conversation Messages */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 3,
          backgroundColor: 'background.default',
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          emailsToShow.map((threadEmail, index) => (
            <EmailMessage
              key={threadEmail.id}
              email={threadEmail}
              isLatest={index === emailsToShow.length - 1}
              onToggleImportant={onToggleImportant}
              onDelete={onDelete}
              onRestore={onRestore}
              isTrash={isTrash}
            />
          ))
        )}
      </Box>
    </Box>
  );
};

export default ConversationViewer;
