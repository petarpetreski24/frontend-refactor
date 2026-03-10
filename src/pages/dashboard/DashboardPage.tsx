import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip, Avatar,
  CircularProgress, Alert, Paper, Rating, IconButton,
} from '@mui/material';
import { Event, Star, CheckCircle, Cancel, Place, NotificationsActive } from '@mui/icons-material';
import { DashboardData, SportEvent, PendingApplication } from '../../types';
import * as dashboardApi from '../../api/dashboard';
import * as applicationsApi from '../../api/applications';
import dayjs from 'dayjs';

function EventCard({ event, onClick }: { event: SportEvent; onClick: () => void }) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={onClick}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Chip label={event.sportName} size="small" color="primary" variant="outlined" />
          <Chip label={event.status} size="small" color={event.status === 'Open' ? 'success' : 'default'} />
        </Box>
        <Typography variant="h6" gutterBottom noWrap>{event.title}</Typography>
        <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
          <Event fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">{dayjs(event.eventDate).format('DD.MM.YYYY HH:mm')}</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Place fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary" noWrap>{event.locationAddress}</Typography>
        </Box>
        <Typography variant="body2" mt={1}>{event.currentParticipants}/{event.maxParticipants} учесници</Typography>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = () => {
    dashboardApi.getDashboard()
      .then(({ data }) => setData(data))
      .catch(() => setError('Грешка при вчитување.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadDashboard(); }, []);

  const handleApprove = async (app: PendingApplication) => {
    try {
      await applicationsApi.approve(app.eventId, app.applicationId);
      loadDashboard();
    } catch { /* ignore */ }
  };

  const handleReject = async (app: PendingApplication) => {
    try {
      await applicationsApi.reject(app.eventId, app.applicationId);
      loadDashboard();
    } catch { /* ignore */ }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return null;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Почетна страница</Typography>

      {/* Stats */}
      <Grid container spacing={2} mb={4}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">{data.stats.totalEventsParticipated}</Typography>
            <Typography color="text.secondary">Учества</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="secondary">{data.stats.totalEventsOrganized}</Typography>
            <Typography color="text.secondary">Организирани</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
              <Typography variant="h3">{data.stats.avgRating?.toFixed(1) || '-'}</Typography>
              <Star color="warning" fontSize="large" />
            </Box>
            <Typography color="text.secondary">Просечна оценка</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Pending Applications */}
      {data.pendingApplications.length > 0 && (
        <Box mb={4}>
          <Typography variant="h5" gutterBottom>Пријави кои чекаат одобрување</Typography>
          {data.pendingApplications.map((app) => (
            <Paper key={app.applicationId} sx={{ p: 2, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar src={app.userPhotoUrl}>{app.userName[0]}</Avatar>
                <Box>
                  <Typography fontWeight={600}>{app.userName}</Typography>
                  <Typography variant="body2" color="text.secondary">за: {app.eventTitle}</Typography>
                </Box>
                {app.userAvgRating && <Rating value={app.userAvgRating} readOnly size="small" />}
              </Box>
              <Box>
                <IconButton color="success" onClick={() => handleApprove(app)}><CheckCircle /></IconButton>
                <IconButton color="error" onClick={() => handleReject(app)}><Cancel /></IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Upcoming Events */}
      {data.upcomingEvents.length > 0 && (
        <Box mb={4}>
          <Typography variant="h5" gutterBottom>Претстојни настани</Typography>
          <Grid container spacing={2}>
            {data.upcomingEvents.map((event) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
                <EventCard event={event} onClick={() => navigate(`/events/${event.id}`)} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Suggested Events */}
      {data.suggestedEvents.length > 0 && (
        <Box mb={4}>
          <Typography variant="h5" gutterBottom>Предложени настани</Typography>
          <Grid container spacing={2}>
            {data.suggestedEvents.map((event) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
                <EventCard event={event} onClick={() => navigate(`/events/${event.id}`)} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Recent Notifications */}
      {data.recentNotifications && data.recentNotifications.length > 0 && (
        <Box mb={4}>
          <Typography variant="h5" gutterBottom>Последни известувања</Typography>
          {data.recentNotifications.map((notif) => (
            <Paper key={notif.id} sx={{ p: 2, mb: 1, display: 'flex', alignItems: 'center', gap: 2, cursor: notif.referenceEventId ? 'pointer' : 'default' }}
              onClick={() => notif.referenceEventId && navigate(`/events/${notif.referenceEventId}`)}>
              <NotificationsActive color={notif.isRead ? 'disabled' : 'primary'} />
              <Box flex={1}>
                <Typography fontWeight={notif.isRead ? 400 : 600}>{notif.title}</Typography>
                <Typography variant="body2" color="text.secondary">{notif.message}</Typography>
              </Box>
            </Paper>
          ))}
          <Button size="small" onClick={() => navigate('/notifications')} sx={{ mt: 1 }}>Сите известувања</Button>
        </Box>
      )}

      {data.upcomingEvents.length === 0 && data.suggestedEvents.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">Нема настани за прикажување.</Typography>
          <Button variant="contained" onClick={() => navigate('/events')} sx={{ mt: 2 }}>Пребарај настани</Button>
        </Paper>
      )}
    </Box>
  );
}
