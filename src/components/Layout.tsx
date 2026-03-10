import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Badge, Menu, MenuItem,
  Box, Container, Drawer, List, ListItemButton, ListItemText, ListItemIcon, Divider,
  Avatar, useMediaQuery, useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon, Notifications as NotifIcon, Sports as SportsIcon,
  Dashboard, Event, Add, Person, ExitToApp, AdminPanelSettings, EventNote,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import * as notificationsApi from '../api/notifications';

export default function Layout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      notificationsApi.getUnreadCount().then(({ data }) => setUnreadCount(data.count)).catch(() => {});
      const interval = setInterval(() => {
        notificationsApi.getUnreadCount().then(({ data }) => setUnreadCount(data.count)).catch(() => {});
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Почетна', path: '/dashboard', icon: <Dashboard /> },
    { label: 'Настани', path: '/events', icon: <Event /> },
    { label: 'Креирај настан', path: '/events/create', icon: <Add /> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Toolbar>
          {isMobile && isAuthenticated && (
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <SportsIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component={RouterLink} to="/"
            sx={{ flexGrow: isMobile ? 1 : 0, textDecoration: 'none', color: 'inherit', mr: 3 }}>
            SportOrganizer
          </Typography>

          {!isMobile && isAuthenticated && (
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
              {navLinks.map((link) => (
                <Button key={link.path} color="inherit" component={RouterLink} to={link.path}
                  startIcon={link.icon} sx={{ fontSize: '0.9rem' }}>
                  {link.label}
                </Button>
              ))}
              {isAdmin && (
                <Button color="inherit" component={RouterLink} to="/admin" startIcon={<AdminPanelSettings />}>
                  Админ
                </Button>
              )}
            </Box>
          )}

          {!isAuthenticated ? (
            <Box>
              <Button color="inherit" component={RouterLink} to="/login">Најава</Button>
              <Button color="inherit" variant="outlined" component={RouterLink} to="/register"
                sx={{ ml: 1, borderColor: 'rgba(255,255,255,0.5)' }}>Регистрација</Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton color="inherit" onClick={() => navigate('/notifications')}>
                <Badge badgeContent={unreadCount} color="error"><NotifIcon /></Badge>
              </IconButton>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Avatar src={user?.profilePhotoUrl} sx={{ width: 32, height: 32 }}>
                  {user?.firstName?.[0]}
                </Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>
                  <Person sx={{ mr: 1 }} /> Мој профил
                </MenuItem>
                <MenuItem onClick={() => { setAnchorEl(null); navigate('/my-events'); }}>
                  <EventNote sx={{ mr: 1 }} /> Мои настани
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ExitToApp sx={{ mr: 1 }} /> Одјави се
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250 }}>
          <List>
            {navLinks.map((link) => (
              <ListItemButton key={link.path} onClick={() => { setDrawerOpen(false); navigate(link.path); }}>
                <ListItemIcon>{link.icon}</ListItemIcon>
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
            {isAdmin && (
              <ListItemButton onClick={() => { setDrawerOpen(false); navigate('/admin'); }}>
                <ListItemIcon><AdminPanelSettings /></ListItemIcon>
                <ListItemText primary="Админ панел" />
              </ListItemButton>
            )}
          </List>
        </Box>
      </Drawer>

      <Container maxWidth="lg" sx={{ flex: 1, py: 3 }}>
        <Outlet />
      </Container>

      <Box component="footer" sx={{ bgcolor: 'primary.dark', color: 'white', py: 2, textAlign: 'center' }}>
        <Typography variant="body2">Sport Activity Organizer &copy; 2026</Typography>
      </Box>
    </Box>
  );
}
