import ThemeProvider from '../components/ThemeProvider';
import { Box, Divider, MenuList, MenuItem, ListItemText, ListItemIcon, Typography, Paper } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import InboxIcon from '@mui/icons-material/Inbox';
import StarIcon from '@mui/icons-material/Star';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';

export const metadata = {
  title: 'Email Client',
  description: 'Modern Email Client built with Next.js and Drizzle',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <Paper
              elevation={1}
              sx={{
                width: 280,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 0,
                borderRight: '1px solid',
                borderRightColor: 'divider',
              }}
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

              {/* Navigation */}
              <Box sx={{ flex: 1, p: 1 }}>
                <MenuList sx={{ p: 0 }}>
                  <MenuItem sx={{ borderRadius: 2, mb: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <InboxIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Inbox"
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </MenuItem>

                  <MenuItem sx={{ borderRadius: 2, mb: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <StarIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Important"
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </MenuItem>

                  <MenuItem sx={{ borderRadius: 2, mb: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <SendIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Sent"
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </MenuItem>

                  <Divider sx={{ my: 2 }} />

                  <MenuItem sx={{ borderRadius: 2, mb: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Trash"
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </MenuItem>
                </MenuList>
              </Box>
            </Paper>

            {/* Main Content */}
            <Box sx={{ flex: 1, overflow: 'auto', backgroundColor: 'background.default' }}>
              {children}
            </Box>
          </Box>
        </ThemeProvider>
      </body>
    </html>
  );
}
