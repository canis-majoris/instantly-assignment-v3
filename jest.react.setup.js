// eslint-disable-next-line @typescript-eslint/no-require-imports
require('@testing-library/jest-dom');

// Mock nuqs for React tests (ESM compatibility issue)
jest.mock('nuqs', () => ({
  useQueryState: jest.fn().mockReturnValue(['', jest.fn()]),
  parseAsString: {
    withDefault: jest.fn().mockReturnValue({}),
  },
  parseAsBoolean: {
    withDefault: jest.fn().mockReturnValue({}),
  },
  parseAsInteger: {
    withDefault: jest.fn().mockReturnValue({}),
  },
  parseAsStringLiteral: jest.fn().mockImplementation(() => ({
    withDefault: jest.fn().mockReturnValue({}),
  })),
}));
