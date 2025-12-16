/**
 * Email Toolbar Actions Component
 * Reusable action buttons for email viewers
 */

'use client';

import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import {
  Star,
  StarBorder,
  Delete as DeleteIcon,
  Reply as ReplyIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';
import { Email } from '@/types';

interface EmailToolbarActionsProps {
  email: Pick<Email, 'id' | 'isImportant' | 'threadId'>;
  onToggleImportant: () => void;
  onDelete: () => void;
  onRestore?: () => void;
  onReply?: () => void;
  isTrash?: boolean;
  deleteTooltip?: string;
  restoreTooltip?: string;
}

export const EmailToolbarActions: React.FC<EmailToolbarActionsProps> = ({
  email,
  onToggleImportant,
  onDelete,
  onRestore,
  onReply,
  isTrash = false,
  deleteTooltip = 'Delete',
  restoreTooltip = 'Restore from trash',
}) => {
  return (
    <>
      <Tooltip title={email.isImportant ? 'Remove from important' : 'Mark as important'}>
        <IconButton onClick={onToggleImportant} size="small" data-testid="toggle-important-button">
          {email.isImportant ? <Star sx={{ color: 'warning.main' }} /> : <StarBorder />}
        </IconButton>
      </Tooltip>

      {onReply && (
        <Tooltip title="Reply">
          <IconButton onClick={onReply} size="small">
            <ReplyIcon />
          </IconButton>
        </Tooltip>
      )}

      {isTrash && onRestore ? (
        <Tooltip title={restoreTooltip}>
          <IconButton onClick={onRestore} size="small" color="primary" data-testid="restore-button">
            <RestoreIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title={deleteTooltip}>
          <IconButton onClick={onDelete} size="small" data-testid="delete-button">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
};

export default EmailToolbarActions;
