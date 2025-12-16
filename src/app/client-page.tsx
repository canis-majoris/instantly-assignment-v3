/**
 * Client Page Component
 * Main email client interface with sidebar, email list, and content viewer
 */

'use client';

import React, { useState, useEffect, useRef, useTransition, useDeferredValue, useCallback } from 'react';
import { Box, Chip, Typography, FormControlLabel, Switch } from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
import { Sidebar, EmailList, EmailViewer, ConversationViewer, EmailComposer, SearchBar } from '@/components';
import { EmailProvider, useEmailContext } from '@/context';
import { useDelayedAction } from '@/hooks';
import { QueryProvider } from '@/providers';
import { Email, EmailStats } from '@/types';

function EmptyEmailState() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
      <Box>
        <EmailIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          Select an email to view
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose an email from the list to see its content here
        </Typography>
      </Box>
    </Box>
  );
}

function EmailClientContent() {
  const {
    emails,
    selectedEmail,
    activeFilter,
    searchQuery,
    isLoading,
    error,
    isThreaded,
    stats,
    setSelectedEmail,
    setActiveFilter,
    setSearchQuery,
    setIsThreaded,
    refreshEmails,
    deleteEmail,
    restoreEmail,
    markAsRead,
    toggleImportant,
  } = useEmailContext();

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isFilterPending, startTransition] = useTransition();
  const deferredEmails = useDeferredValue(emails);
  const deferredFilter = useDeferredValue(activeFilter);
  const isPending = isFilterPending || deferredFilter !== activeFilter || deferredEmails !== emails;
  const isTrash = activeFilter === 'trash';
  const prevIsTrashRef = useRef(isTrash);

  // Clear selection when switching between trash and non-trash
  useEffect(() => {
    if (prevIsTrashRef.current !== isTrash) {
      setSelectedEmail(null);
      prevIsTrashRef.current = isTrash;
    }
  }, [isTrash, setSelectedEmail]);

  // Mark email as read after 1 second of viewing
  const handleMarkAsRead = useCallback(() => {
    if (selectedEmail) markAsRead(selectedEmail.id);
  }, [selectedEmail, markAsRead]);

  useDelayedAction(
    Boolean(selectedEmail && !selectedEmail.isRead),
    handleMarkAsRead,
    1000,
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        activeFilter={activeFilter}
        onFilterChange={(filter) => startTransition(() => setActiveFilter(filter))}
        onComposeClick={() => setIsComposerOpen(true)}
        stats={stats}
      />

      {/* Email List Panel */}
      <Box sx={{ width: 400, borderRight: '1px solid', borderRightColor: 'divider', display: 'flex', flexDirection: 'column', backgroundColor: 'background.paper' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderBottomColor: 'divider' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
            {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Chip label={`${stats.total} Total`} size="small" color="primary" variant="outlined" />
            <Chip label={`${stats.unread} Unread`} size="small" color="warning" variant="outlined" />
            <Chip label={`${stats.important} Important`} size="small" color="secondary" variant="outlined" />
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={isThreaded}
                onChange={(e) => startTransition(() => setIsThreaded(e.target.checked))}
                size="small"
                data-testid="threading-toggle"
              />
            }
            label={<Typography variant="caption" color="text.secondary">Group by thread</Typography>}
          />
        </Box>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderBottomColor: 'divider' }}>
          <SearchBar
            value={searchQuery}
            onChange={(value) => startTransition(() => setSearchQuery(value))}
            placeholder="Search emails..."
          />
        </Box>
        <EmailList
          emails={deferredEmails}
          selectedEmailId={selectedEmail?.id ?? null}
          onEmailSelect={setSelectedEmail}
          isLoading={isLoading}
          isPending={isPending}
          error={error}
        />
      </Box>

      {/* Email Content Panel */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }} data-testid="email-content-panel">
        {selectedEmail ? (
          isThreaded ? (
            <ConversationViewer
              email={selectedEmail}
              isThreaded={isThreaded}
              filter={activeFilter}
              onClose={() => setSelectedEmail(null)}
              onDelete={deleteEmail}
              onToggleImportant={toggleImportant}
              onRestore={restoreEmail}
              isTrash={isTrash}
            />
          ) : (
            <EmailViewer
              email={selectedEmail}
              onClose={() => setSelectedEmail(null)}
              onDelete={deleteEmail}
              onToggleImportant={toggleImportant}
              onRestore={restoreEmail}
              isTrash={isTrash}
            />
          )
        ) : (
          <EmptyEmailState />
        )}
      </Box>

      {isComposerOpen && <EmailComposer onClose={() => setIsComposerOpen(false)} onSent={refreshEmails} />}
    </Box>
  );
}

export default function ClientPage({ emails: initialEmails, stats: initialStats }: { emails: Email[]; stats: EmailStats }) {
  return (
    <QueryProvider>
      <EmailProvider initialEmails={initialEmails} initialStats={initialStats}>
        <EmailClientContent />
      </EmailProvider>
    </QueryProvider>
  );
}
