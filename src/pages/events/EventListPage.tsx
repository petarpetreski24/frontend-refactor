import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, TextField, Button, Chip, Pagination,
  CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, Checkbox,
  FormControlLabel, Paper, Rating, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Search, Event as EventIcon, Place, Map, ViewList, MyLocation } from '@mui/icons-material';
import { SportEvent, Sport, EventSearchParams, SKILL_LEVEL_LABELS } from '../../types';
import * as eventsApi from '../../api/events';
import * as sportsApi from '../../api/sports';
import { EVENT_STATUS_LABELS } from '../../types';
import EventsMapView from '../../components/EventsMapView';
import dayjs, { Dayjs } from 'dayjs';

export default function EventListPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedSport, setSelectedSport] = useState<number | ''>('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(null);
  const [dateTo, setDateTo] = useState<Dayjs | null>(null);
  const [minSkillLevel, setMinSkillLevel] = useState<string>('');
  const [userLat, setUserLat] = useState<number | undefined>();
  const [userLng, setUserLng] = useState<number | undefined>();
  const [radiusKm, setRadiusKm] = useState<number | undefined>();
  const pageSize = 12;

  useEffect(() => {
    sportsApi.getAll().then(({ data }) => setSports(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: EventSearchParams = {
      keyword: keyword || undefined,
      sportIds: selectedSport ? [selectedSport as number] : undefined,
      dateFrom: dateFrom ? dateFrom.format('YYYY-MM-DD') : undefined,
      dateTo: dateTo ? dateTo.format('YYYY-MM-DD') : undefined,
      minSkillLevel: minSkillLevel || undefined,
      availableOnly,
      sortBy,
      page,
      pageSize,
      lat: userLat,
      lng: userLng,
      radiusKm,
    };
    eventsApi.search(params)
      .then(({ data }) => { setEvents(data.items); setTotalCount(data.totalCount); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [keyword, selectedSport, dateFrom, dateTo, minSkillLevel, availableOnly, sortBy, page, userLat, userLng, radiusKm]);

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
          if (!radiusKm) setRadiusKm(25);
          if (sortBy !== 'distance') setSortBy('distance');
          setPage(1);
        },
        () => {
          alert('Не може да се пристапи до локацијата. Проверете ги дозволите на прелистувачот.');
        }
      );
    }
  };

  const clearLocation = () => {
    setUserLat(undefined);
    setUserLng(undefined);
    setRadiusKm(undefined);
    if (sortBy === 'distance') setSortBy('date');
    setPage(1);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Пребарување на настани</Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, v) => v && setViewMode(v)}
          size="small"
        >
          <ToggleButton value="list"><ViewList sx={{ mr: 0.5 }} /> Листа</ToggleButton>
          <ToggleButton value="map"><Map sx={{ mr: 0.5 }} /> Мапа</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth size="small" placeholder="Пребарај..."
              value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1); }}
              InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} /> }} />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Спорт</InputLabel>
              <Select value={selectedSport} label="Спорт" onChange={e => { setSelectedSport(e.target.value as number); setPage(1); }}>
                <MenuItem value="">Сите</MenuItem>
                {sports.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Сортирај</InputLabel>
              <Select value={sortBy} label="Сортирај" onChange={e => setSortBy(e.target.value)}>
                <MenuItem value="date">По датум</MenuItem>
                <MenuItem value="rating">По оценка</MenuItem>
                {userLat && <MenuItem value="distance">По оддалеченост</MenuItem>}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <FormControlLabel control={<Checkbox checked={availableOnly} onChange={e => { setAvailableOnly(e.target.checked); setPage(1); }} />}
              label="Само слободни" />
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
          <Grid size={{ xs: 6, md: 2.5 }}>
            <DatePicker label="Од датум" value={dateFrom} onChange={(v) => { setDateFrom(v); setPage(1); }}
              slotProps={{ textField: { size: 'small', fullWidth: true } }} />
          </Grid>
          <Grid size={{ xs: 6, md: 2.5 }}>
            <DatePicker label="До датум" value={dateTo} onChange={(v) => { setDateTo(v); setPage(1); }}
              slotProps={{ textField: { size: 'small', fullWidth: true } }} />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Ниво</InputLabel>
              <Select value={minSkillLevel} label="Ниво" onChange={e => { setMinSkillLevel(e.target.value); setPage(1); }}>
                <MenuItem value="">Сите</MenuItem>
                {Object.entries(SKILL_LEVEL_LABELS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            {!userLat ? (
              <Button variant="outlined" size="small" startIcon={<MyLocation />} onClick={handleUseMyLocation} fullWidth>
                Моја локација
              </Button>
            ) : (
              <Box display="flex" gap={1} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Радиус</InputLabel>
                  <Select value={radiusKm || 25} label="Радиус" onChange={e => { setRadiusKm(e.target.value as number); setPage(1); }}>
                    {[1, 5, 10, 25, 50, 100].map(r => <MenuItem key={r} value={r}>{r} km</MenuItem>)}
                  </Select>
                </FormControl>
                <Button size="small" onClick={clearLocation} color="error" variant="text">X</Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
      ) : events.length === 0 ? (
        <Alert severity="info">Нема настани кои ги задоволуваат критериумите.</Alert>
      ) : viewMode === 'map' ? (
        <EventsMapView events={events} />
      ) : (
        <>
          <Grid container spacing={2}>
            {events.map(event => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={event.id}>
                <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
                  onClick={() => navigate(`/events/${event.id}`)}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Chip label={event.sportName} size="small" color="primary" variant="outlined" />
                      <Chip label={EVENT_STATUS_LABELS[event.status] || event.status} size="small"
                        color={event.status === 'Open' ? 'success' : event.status === 'Full' ? 'warning' : 'default'} />
                    </Box>
                    <Typography variant="h6" gutterBottom noWrap>{event.title}</Typography>
                    <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                      <EventIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {dayjs(event.eventDate).format('DD.MM.YYYY HH:mm')} ({event.durationMinutes} мин)
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                      <Place fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" noWrap>{event.locationAddress}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">{event.currentParticipants}/{event.maxParticipants} учесници</Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Typography variant="body2">{event.organizerName}</Typography>
                        {event.organizerRating && <Rating value={event.organizerRating} readOnly size="small" precision={0.5} />}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination count={Math.ceil(totalCount / pageSize)} page={page} onChange={(_, v) => setPage(v)} color="primary" />
          </Box>
        </>
      )}
    </Box>
  );
}
