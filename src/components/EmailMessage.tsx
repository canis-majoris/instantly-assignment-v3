/**
 * Email Message Component
 * Single email message displayed within a conversation thread
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Star,
  StarBorder,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';
import { Email } from '@/types';
import { getDisplayName, formatShortDate } from '@/lib/utils';
import { EmailAvatar } from './EmailAvatar';

export interface EmailMessageProps {
  email: Email;
  isLatest: boolean;
  onToggleImportant: (
    emailId: number,
    currentIsImportant?: boolean,
    singleEmailOnly?: boolean,
  ) => void;
  onDelete: (emailId: number) => void;
  onRestore?: (emailId: number) => void;
  isTrash?: boolean;
}

const EmailMessage: React.FC<EmailMessageProps> = ({
  email,
  isLatest,
  onToggleImportant,
  onDelete,
  onRestore,
  isTrash = false,
}) => {
  const [expanded, setExpanded] = React.useState(isLatest);

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        mb: 2,
        '&:before': { display: 'none' },
        backgroundColor: isLatest ? 'background.paper' : 'background.default',
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
            gap: 2,
          },
        }}
      >
        <EmailAvatar email={email} size="small" />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {getDisplayName(email.from)}
            </Typography>
            {!email.isRead && (
              <Chip label="Unread" size="small" color="warning" sx={{ height: 20 }} />
            )}
            {email.isImportant && <Star sx={{ color: 'warning.main', fontSize: 18 }} />}
          </Box>
          <Typography variant="caption" color="text.secondary">
            {formatShortDate(email.createdAt)}
          </Typography>
        </Box>
        {!expanded && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              maxWidth: 300,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {email.content?.substring(0, 60)}...
          </Typography>
        )}
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ pl: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              To: {email.to}
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Tooltip title={email.isImportant ? 'Remove from important' : 'Mark as important'}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleImportant(email.id, email.isImportant, true);
                }}
              >
                {email.isImportant ? <Star sx={{ color: 'warning.main' }} /> : <StarBorder />}
              </IconButton>
            </Tooltip>
            {isTrash ? (
              onRestore && (
                <Tooltip title="Restore">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRestore(email.id);
                    }}
                  >
                    <RestoreIcon />
                  </IconButton>
                </Tooltip>
              )
            ) : (
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(email.id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              backgroundColor: 'background.paper',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
              {email.content || 'No content'}
            </Typography>
          </Paper>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default EmailMessage;
