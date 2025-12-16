/**
 * Email Composer Component
 * Form for composing and sending new emails
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Paper,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon, Send as SendIcon } from '@mui/icons-material';
import { EmailComposerFormData, EMPTY_COMPOSER_FORM, CreateEmailRequest } from '@/types';
import { useCreateEmail } from '@/hooks/useEmailQueries';
import { validateEmailList } from '@/lib/utils';

interface EmailComposerProps {
  onClose: () => void;
  onSent: () => void;
  initialData?: Partial<EmailComposerFormData>;
  threadId?: string;
}

const EmailComposer: React.FC<EmailComposerProps> = ({
  onClose,
  onSent,
  initialData = {},
  threadId,
}) => {
  const [formData, setFormData] = useState<EmailComposerFormData>({
    ...EMPTY_COMPOSER_FORM,
    ...initialData,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EmailComposerFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createEmailMutation = useCreateEmail();

  /**
   * Handles input field changes
   */
  const handleChange = useCallback(
    (field: keyof EmailComposerFormData) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = event.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear field error when user types
        if (errors[field]) {
          setErrors((prev) => ({ ...prev, [field]: undefined }));
        }

        // Clear submit error
        if (submitError) {
          setSubmitError(null);
        }
      },
    [errors, submitError],
  );

  /**
   * Validates the form before submission
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof EmailComposerFormData, string>> = {};

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    // To field validation
    if (!formData.to.trim()) {
      newErrors.to = 'At least one recipient is required';
    } else if (!validateEmailList(formData.to)) {
      newErrors.to = 'Please enter valid email addresses';
    }

    // CC field validation (optional but must be valid if provided)
    if (formData.cc.trim() && !validateEmailList(formData.cc)) {
      newErrors.cc = 'Please enter valid email addresses';
    }

    // BCC field validation (optional but must be valid if provided)
    if (formData.bcc.trim() && !validateEmailList(formData.bcc)) {
      newErrors.bcc = 'Please enter valid email addresses';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (!validateForm()) {
        return;
      }

      setSubmitError(null);

      const emailData: CreateEmailRequest = {
        subject: formData.subject,
        to: formData.to,
        cc: formData.cc || undefined,
        bcc: formData.bcc || undefined,
        content: formData.content,
        threadId: threadId,
      };

      createEmailMutation.mutate(emailData, {
        onSuccess: () => {
          onSent();
          onClose();
        },
        onError: (error) => {
          setSubmitError(error.message || 'Failed to send email');
        },
      });
    },
    [formData, threadId, validateForm, onSent, onClose, createEmailMutation],
  );

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 0,
        right: 24,
        width: 500,
        maxWidth: 'calc(100vw - 48px)',
        maxHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '8px 8px 0 0',
        overflow: 'hidden',
        zIndex: 1300,
      }}
      data-testid="email-composer"
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          backgroundColor: 'primary.light',
          color: 'primary.contrastText',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          New Message
        </Typography>
        <Box>
          <IconButton
            size="small"
            sx={{ color: 'inherit' }}
            onClick={onClose}
            data-testid="composer-close-button"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Form */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        {submitError && (
          <Alert severity="error" sx={{ m: 2, mb: 0 }}>
            {submitError}
          </Alert>
        )}

        <Box sx={{ p: 2, pb: 0 }}>
          <TextField
            fullWidth
            label="To"
            placeholder="recipient@example.com"
            value={formData.to}
            onChange={handleChange('to')}
            error={!!errors.to}
            helperText={errors.to}
            size="small"
            sx={{ mb: 2 }}
            inputProps={{ 'data-testid': 'composer-to' }}
          />

          <TextField
            fullWidth
            label="Cc"
            placeholder="cc@example.com"
            value={formData.cc}
            onChange={handleChange('cc')}
            error={!!errors.cc}
            helperText={errors.cc}
            size="small"
            sx={{ mb: 2 }}
            inputProps={{ 'data-testid': 'composer-cc' }}
          />

          <TextField
            fullWidth
            label="Bcc"
            placeholder="bcc@example.com"
            value={formData.bcc}
            onChange={handleChange('bcc')}
            error={!!errors.bcc}
            helperText={errors.bcc}
            size="small"
            sx={{ mb: 2 }}
            inputProps={{ 'data-testid': 'composer-bcc' }}
          />

          <TextField
            fullWidth
            label="Subject"
            placeholder="Enter subject"
            value={formData.subject}
            onChange={handleChange('subject')}
            error={!!errors.subject}
            helperText={errors.subject}
            size="small"
            sx={{ mb: 2 }}
            inputProps={{ 'data-testid': 'composer-subject' }}
          />
        </Box>

        <Divider />

        <Box sx={{ flex: 1, p: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={8}
            placeholder="Write your message here..."
            value={formData.content}
            onChange={handleChange('content')}
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            inputProps={{ 'data-testid': 'composer-content' }}
          />
        </Box>

        {/* Footer */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderTop: '1px solid',
            borderTopColor: 'divider',
          }}
        >
          <Button
            type="submit"
            variant="contained"
            startIcon={createEmailMutation.isPending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            disabled={createEmailMutation.isPending}
            data-testid="composer-send-button"
          >
            {createEmailMutation.isPending ? 'Sending...' : 'Send'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default EmailComposer;
