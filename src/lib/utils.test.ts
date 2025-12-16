/**
 * Tests for utility functions
 */

import {
  getInitials,
  getDisplayName,
  formatCompactDate,
  formatShortDate,
  formatFullDate,
  truncateText,
  generateThreadId,
  isValidEmail,
  validateEmailList,
} from './utils';

describe('getInitials', () => {
  it('should extract first two characters from email username', () => {
    expect(getInitials('john@example.com')).toBe('JO');
    expect(getInitials('alice@test.org')).toBe('AL');
  });

  it('should handle short usernames', () => {
    expect(getInitials('a@example.com')).toBe('A');
    expect(getInitials('ab@example.com')).toBe('AB');
  });

  it('should convert to uppercase', () => {
    expect(getInitials('john@example.com')).toBe('JO');
    expect(getInitials('JOHN@example.com')).toBe('JO');
  });
});

describe('getDisplayName', () => {
  it('should convert email username to display name', () => {
    expect(getDisplayName('john.doe@example.com')).toBe('John Doe');
    expect(getDisplayName('alice.smith@test.org')).toBe('Alice Smith');
  });

  it('should handle single word usernames', () => {
    expect(getDisplayName('john@example.com')).toBe('John');
  });

  it('should capitalize each part', () => {
    expect(getDisplayName('john.doe.smith@example.com')).toBe('John Doe Smith');
  });

  it('should handle lowercase and uppercase input', () => {
    expect(getDisplayName('JOHN.DOE@example.com')).toBe('JOHN DOE');
  });
});

describe('formatCompactDate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should show time for dates within 24 hours', () => {
    const now = new Date('2025-12-16T12:00:00');
    jest.setSystemTime(now);

    const twoHoursAgo = new Date('2025-12-16T10:30:00');
    const result = formatCompactDate(twoHoursAgo);

    // Should contain time format
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it('should show date for dates older than 24 hours', () => {
    const now = new Date('2025-12-16T12:00:00');
    jest.setSystemTime(now);

    const twoDaysAgo = new Date('2025-12-14T10:30:00');
    const result = formatCompactDate(twoDaysAgo);

    // Should contain date format (varies by locale)
    expect(result).toBeTruthy();
    expect(result).not.toMatch(/^\d{1,2}:\d{2}$/);
  });
});

describe('formatShortDate', () => {
  it('should format date with month, day, and time', () => {
    const date = new Date('2025-12-16T14:30:00');
    const result = formatShortDate(date);

    expect(result).toBeTruthy();
    // Should contain some date components
    expect(result.length).toBeGreaterThan(5);
  });
});

describe('formatFullDate', () => {
  it('should format date with full details', () => {
    const date = new Date('2025-12-16T14:30:00');
    const result = formatFullDate(date);

    expect(result).toBeTruthy();
    // Full format should be longer than short format
    expect(result.length).toBeGreaterThan(10);
  });
});

describe('truncateText', () => {
  it('should return "No content" for null', () => {
    expect(truncateText(null)).toBe('No content');
  });

  it('should return text as-is if shorter than maxLength', () => {
    expect(truncateText('Hello', 30)).toBe('Hello');
  });

  it('should truncate text longer than maxLength', () => {
    expect(truncateText('This is a very long text that should be truncated', 20)).toBe(
      'This is a very long ...',
    );
  });

  it('should use default maxLength of 30', () => {
    const text = 'A'.repeat(40);
    expect(truncateText(text)).toBe('A'.repeat(30) + '...');
  });

  it('should handle empty string', () => {
    expect(truncateText('')).toBe('No content');
  });

  it('should handle exact length', () => {
    expect(truncateText('12345', 5)).toBe('12345');
  });
});

describe('generateThreadId', () => {
  it('should generate a unique thread ID', () => {
    const id1 = generateThreadId();
    const id2 = generateThreadId();

    expect(id1).not.toBe(id2);
  });

  it('should start with "thread-"', () => {
    const id = generateThreadId();
    expect(id.startsWith('thread-')).toBe(true);
  });

  it('should contain timestamp', () => {
    const before = Date.now();
    const id = generateThreadId();
    const after = Date.now();

    const parts = id.split('-');
    const timestamp = parseInt(parts[1], 10);

    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });
});

describe('isValidEmail', () => {
  it('should return true for valid email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.org')).toBe(true);
    expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
  });

  it('should return false for invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('missing@domain')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('no spaces@example.com')).toBe(false);
  });

  it('should handle whitespace', () => {
    expect(isValidEmail('  test@example.com  ')).toBe(true);
  });
});

describe('validateEmailList', () => {
  it('should return true for empty string', () => {
    expect(validateEmailList('')).toBe(true);
    expect(validateEmailList('   ')).toBe(true);
  });

  it('should return true for valid single email', () => {
    expect(validateEmailList('test@example.com')).toBe(true);
  });

  it('should return true for valid comma-separated emails', () => {
    expect(validateEmailList('a@example.com, b@example.com')).toBe(true);
    expect(validateEmailList('a@example.com,b@example.com,c@example.com')).toBe(true);
  });

  it('should return false if any email is invalid', () => {
    expect(validateEmailList('valid@example.com, invalid')).toBe(false);
    expect(validateEmailList('invalid, valid@example.com')).toBe(false);
  });
});
