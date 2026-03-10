import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Grid, Paper, CircularProgress, Alert, Button,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import SportsIcon from '@mui/icons-material/Sports';
import CommentIcon from '@mui/icons-material/Comment';
import * as adminApi from '../../api/admin';
import { AdminStats } from '../../types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.getStats()
      .then(res => setStats(res.data))
      .catch(() => setError('Грешка при вчитување на статистики.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!stats) return null;

  const cards = [
    { label: 'Вкупно корисници', value: stats.totalUsers, icon: <PeopleIcon fontSize="large" />, color: '#1565c0' },
    { label: 'Нови корисници (месец)', value: stats.newUsersThisMonth, icon: <PeopleIcon fontSize="large" />, color: '#2e7d32' },
    { label: 'Вкупно настани', value: stats.totalEvents, icon: <EventIcon fontSize="large" />, color: '#e65100' },
    { label: 'Активни настани', value: stats.activeEvents, icon: <EventIcon fontSize="large" />, color: '#6a1b9a' },
    { label: 'Нови настани (месец)', value: stats.newEventsThisMonth, icon: <EventIcon fontSize="large" />, color: '#00838f' },
    { label: 'Вкупно спортови', value: stats.totalSports, icon: <SportsIcon fontSize="large" />, color: '#ad1457' },
    { label: 'Вкупно коментари', value: stats.totalComments, icon: <CommentIcon fontSize="large" />, color: '#4e342e' },
    { label: 'Вкупно оценки', value: stats.totalRatings, icon: <SportsIcon fontSize="large" />, color: '#37474f' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Админ панел</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {cards.map((c, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ color: c.color }}>{c.icon}</Box>
              <Box>
                <Typography variant="h5">{c.value}</Typography>
                <Typography variant="body2" color="text.secondary">{c.label}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Button fullWidth variant="contained" component={RouterLink} to="/admin/users" size="large"
            startIcon={<PeopleIcon />}>
            Управувај корисници
          </Button>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Button fullWidth variant="contained" component={RouterLink} to="/admin/sports" size="large"
            startIcon={<SportsIcon />} color="secondary">
            Управувај спортови
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
