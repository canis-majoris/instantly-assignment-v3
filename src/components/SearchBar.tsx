/**
 * Search Bar Component
 * Reusable search input with debounced updates
 */

'use client';

import React from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useDebouncedState } from '@/hooks';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Debounce delay in ms before syncing to parent (default: 300) */
  debounceMs?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search emails...',
  disabled = false,
  debounceMs = 300,
}) => {
  const [localValue, setLocalValue, flush] = useDebouncedState(value, onChange, debounceMs);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(event.target.value);
  };

  const handleClear = () => {
    flush(); // Cancel pending debounce
    setLocalValue('');
    onChange(''); // Immediately notify parent
  };

  return (
    <TextField
      fullWidth
      placeholder={placeholder}
      variant="outlined"
      size="small"
      value={localValue}
      onChange={handleChange}
      disabled={disabled}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={handleClear}
              edge="end"
              aria-label="Clear search"
              data-testid="search-clear-button"
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'background.default',
        },
      }}
      inputProps={{
        'data-testid': 'search-input',
        'aria-label': 'Search emails',
      }}
    />
  );
};

export default SearchBar;
