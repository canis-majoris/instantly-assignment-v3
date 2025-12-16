/**
 * Sidebar Component
 * Displays navigation filters and compose button
 */

'use client';

import React from 'react';
import {
  Box,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Divider,
  Badge,
  MenuList,
  MenuItem,
} from '@mui/material';
import {
  Inbox as InboxIcon,
  Star as StarIcon,
  Send as SendIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { EmailFilter, EmailStats } from '@/types';

interface SidebarProps {
  activeFilter: EmailFilter;
  onFilterChange: (filter: EmailFilter) => void;
  onComposeClick: () => void;
  stats: EmailStats;
}

interface FilterItem {
  id: EmailFilter;
  label: string;
  icon: React.ReactNode;
  getBadge?: (stats: EmailStats) => number | undefined;
}

const FILTER_ITEMS: FilterItem[] = [
  {
    id: 'inbox',
    label: 'Inbox',
    icon: <InboxIcon fontSize="small" />,
    getBadge: (stats) => (stats.unread > 0 ? stats.unread : undefined),
  },
  {
    id: 'important',
    label: 'Important',
    icon: <StarIcon fontSize="small" />,
    getBadge: (stats) => (stats.important > 0 ? stats.important : undefined),
  },
  {
    id: 'sent',
    label: 'Sent',
    icon: <SendIcon fontSize="small" />,
    getBadge: (stats) => (stats.sent > 0 ? stats.sent : undefined),
  },
];

const TRASH_ITEM: FilterItem = {
  id: 'trash',
  label: 'Trash',
  icon: <DeleteIcon fontSize="small" />,
};

const Sidebar: React.FC<SidebarProps> = ({
  activeFilter,
  onFilterChange,
  onComposeClick,
  stats,
}) => {
  const renderFilterItem = (item: FilterItem) => {
    const badgeCount = item.getBadge?.(stats);
    const isActive = activeFilter === item.id;

    return (
      <MenuItem
        key={item.id}
        sx={{ borderRadius: 2, mb: 0.5 }}
        onClick={() => onFilterChange(item.id)}
        selected={isActive}
        data-testid={`filter-${item.id}`}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
        <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 500 }} />
        {badgeCount !== undefined && (
          <Badge badgeContent={badgeCount} color="secondary" sx={{ ml: 1 }} />
        )}
      </MenuItem>
    );
  };

  return (
    <Box
      sx={{
        width: 280,
        borderRight: '1px solid',
        borderRightColor: 'divider',
        backgroundColor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
      }}
      data-testid="sidebar"
    >
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderBottomColor: 'divider' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          📧 Email Client
        </Typography>
      </Box>
      {/* Compose Button */}
      <Box sx={{ p: 1 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={onComposeClick}
          fullWidth
          sx={{
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 600,
            py: 1.5,
          }}
          data-testid="compose-button"
        >
          Compose
        </Button>
      </Box>

      <Divider />

      {/* Filter List */}
      <MenuList sx={{ p: 0 }}>
        {FILTER_ITEMS.map(renderFilterItem)}

        {/* Divider before Trash */}
        <Divider sx={{ my: 1 }} />

        {/* Trash Item */}
        {renderFilterItem(TRASH_ITEM)}
      </MenuList>
    </Box>
  );
};

export default Sidebar;
