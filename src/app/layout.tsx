import { Box } from '@mui/material';
import { Providers } from './providers';

export const metadata = {
  title: 'Email Client',
  description: 'Modern Email Client built with Next.js and Drizzle',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Main Content */}
            <Box sx={{ flex: 1, overflow: 'auto', backgroundColor: 'background.default' }}>
              {children}
            </Box>
          </Box>
        </Providers>
      </body>
    </html>
  );
}
