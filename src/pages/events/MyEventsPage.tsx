import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Tabs, Tab, Card, CardContent, CardActions, Button,
  Chip, Grid, CircularProgress, Alert, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import dayjs from 'dayjs';
import * as eventsApi from '../../api/events';
import { SportEvent, EVENT_STATUS_LABELS } from '../../types';

const statusColor = (s: string) => {
  switch (s) {
    case 'Open': return 'success';
    case 'Full': return 'warning';
    case 'InProgress': return 'info';
    case 'Completed': return 'default';
    case 'Cancelled': return 'error';
    default: return 'default';
  }
};

export default function MyEventsPage() {
  const [tab, setTab] = useState(0);
  const [organized, setOrganized] = useState<SportEvent[]>([]);
  const [participating, setParticipating] = useState<SportEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    Promise.all([eventsApi.getMyOrganized(), eventsApi.getMyParticipating()])
      .then(([orgRes, partRes]) => {
        setOrganized(orgRes.data);
        setParticipating(partRes.data);
      })
      .catch(() => setError('Грешка при вчитување на настани.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  const allEvents = tab === 0 ? organized : participating;
  const events = allEvents.filter(ev => {
    if (timeFilter === 'upcoming') return dayjs(ev.eventDate).isAfter(dayjs()) && ev.status !== 'Completed' && ev.status !== 'Cancelled';
    if (timeFilter === 'past') return dayjs(ev.eventDate).isBefore(dayjs()) || ev.status === 'Completed' || ev.status === 'Cancelled';
    return true;
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Мои настани</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Организирани (${organized.length})`} />
        <Tab label={`Учествувам (${participating.length})`} />
      </Tabs>
      <Box mb={2}>
        <ToggleButtonGroup
          value={timeFilter}
          exclusive
          onChange={(_, v) => v && setTimeFilter(v)}
          size="small"
        >
          <ToggleButton value="all">Сите</ToggleButton>
          <ToggleButton value="upcoming">Претстојни</ToggleButton>
          <ToggleButton value="past">Минати</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {events.length === 0 ? (
        <Alert severity="info">
          {tab === 0 ? 'Немате организирано настани.' : 'Не учествувате во настани.'}
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {events.map(ev => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={ev.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" noWrap sx={{ flex: 1 }}>{ev.title}</Typography>
                    <Chip label={EVENT_STATUS_LABELS[ev.status] || ev.status} color={statusColor(ev.status) as any} size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {ev.sportName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dayjs(ev.eventDate).format('DD.MM.YYYY HH:mm')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {ev.locationAddress}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {ev.currentParticipants}/{ev.maxParticipants} учесници
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" component={RouterLink} to={`/events/${ev.id}`}>
                    Детали
                  </Button>
                  {tab === 0 && ev.status === 'Open' && (
                    <Button size="small" component={RouterLink} to={`/events/${ev.id}/edit`}>
                      Уреди
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
