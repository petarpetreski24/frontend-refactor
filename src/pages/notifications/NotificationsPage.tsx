import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, List, ListItem, ListItemText, ListItemIcon, ListItemButton,
  IconButton, Button, Chip, CircularProgress, Alert, Paper, Divider,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckIcon from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import SettingsIcon from '@mui/icons-material/Settings';
import * as notificationsApi from '../../api/notifications';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/mk';

dayjs.extend(relativeTime);
dayjs.locale('mk');

interface NotificationItem {
  id: number; type: string; title: string; message: string;
  referenceEventId?: number; isRead: boolean; createdAt: string;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = () => {
    notificationsApi.getAll()
      .then(res => setNotifications(res.data))
      .catch(() => setError('Грешка при вчитување на нотификации.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { }
  };

  const handleClick = (n: NotificationItem) => {
    if (!n.isRead) markAsRead(n.id);
    if (n.referenceEventId) navigate(`/events/${n.referenceEventId}`);
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Box maxWidth={700} mx="auto">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Нотификации
          {unreadCount > 0 && (
            <Chip label={`${unreadCount} нови`} color="primary" size="small" sx={{ ml: 2 }} />
          )}
        </Typography>
        <Box display="flex" gap={1}>
          {unreadCount > 0 && (
            <Button startIcon={<DoneAllIcon />} onClick={markAllAsRead}>
              Означи ги сите
            </Button>
          )}
          <IconButton onClick={() => navigate('/notifications/preferences')} title="Поставки за нотификации">
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {notifications.length === 0 ? (
        <Alert severity="info">Немате нотификации.</Alert>
      ) : (
        <Paper>
          <List disablePadding>
            {notifications.map((n, i) => (
              <Box key={n.id}>
                {i > 0 && <Divider />}
                <ListItem
                  disablePadding
                  secondaryAction={
                    !n.isRead ? (
                      <IconButton size="small" onClick={() => markAsRead(n.id)} title="Означи како прочитано">
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    ) : undefined
                  }
                >
                  <ListItemButton
                    onClick={() => handleClick(n)}
                    sx={{ bgcolor: n.isRead ? 'transparent' : 'action.hover' }}
                  >
                    <ListItemIcon>
                      <NotificationsIcon color={n.isRead ? 'disabled' : 'primary'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={n.title}
                      secondary={
                        <>
                          {n.message}
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(n.createdAt).fromNow()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              </Box>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
