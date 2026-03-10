import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Box, Typography, Paper, TextField, Button, FormControl, InputLabel, Select,
  MenuItem, Grid, Alert, CircularProgress,
} from '@mui/material';
import { Sport, SKILL_LEVELS, SKILL_LEVEL_LABELS } from '../../types';
import * as sportsApi from '../../api/sports';
import * as eventsApi from '../../api/events';
import LocationPicker from '../../components/LocationPicker';
import dayjs from 'dayjs';

interface FormData {
  sportId: number; title: string; description: string; eventDate: string;
  durationMinutes: number; locationAddress: string; locationLat: number;
  locationLng: number; maxParticipants: number; minSkillLevel: string;
}

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>();

  const locationLat = watch('locationLat');
  const locationLng = watch('locationLng');
  const locationAddress = watch('locationAddress');

  useEffect(() => {
    Promise.all([sportsApi.getAll(), eventsApi.getById(parseInt(id!))]).then(([sportsRes, eventRes]) => {
      setSports(sportsRes.data);
      const e = eventRes.data;
      reset({
        sportId: e.sportId, title: e.title, description: e.description,
        eventDate: dayjs(e.eventDate).format('YYYY-MM-DDTHH:mm'),
        durationMinutes: e.durationMinutes, locationAddress: e.locationAddress,
        locationLat: e.locationLat, locationLng: e.locationLng,
        maxParticipants: e.maxParticipants, minSkillLevel: e.minSkillLevel || '',
      });
    }).catch(() => setError('Грешка при вчитување.')).finally(() => setLoading(false));
  }, [id]);

  const onSubmit = async (data: FormData) => {
    try {
      await eventsApi.update(parseInt(id!), { ...data, minSkillLevel: data.minSkillLevel || undefined });
      navigate(`/events/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Грешка при ажурирање.');
    }
  };

  const handleLocationChange = (lat: number, lng: number, address: string) => {
    setValue('locationLat', lat);
    setValue('locationLng', lng);
    setValue('locationAddress', address);
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  return (
    <Box maxWidth={700} mx="auto">
      <Typography variant="h4" gutterBottom>Уреди настан</Typography>
      <Paper sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Controller name="sportId" control={control} rules={{ required: 'Изберете спорт' }}
                render={({ field }) => (
                  <FormControl fullWidth><InputLabel>Спорт</InputLabel>
                    <Select {...field} label="Спорт">{sports.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}</Select>
                  </FormControl>
                )} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Наслов" {...register('title', { required: 'Задолжително' })} error={!!errors.title} helperText={errors.title?.message} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth multiline rows={4} label="Опис" {...register('description', { required: 'Задолжително' })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Датум и време" type="datetime-local" InputLabelProps={{ shrink: true }} {...register('eventDate', { required: 'Задолжително' })} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Времетраење (мин)" type="number" {...register('durationMinutes', { required: true, valueAsNumber: true })} />
            </Grid>
            <Grid size={12}>
              <LocationPicker
                value={locationLat ? { lat: locationLat, lng: locationLng, address: locationAddress } : undefined}
                onChange={handleLocationChange}
                label="Локација на настанот"
              />
            </Grid>
            <Grid size={6}><TextField fullWidth label="Макс. учесници" type="number" {...register('maxParticipants', { valueAsNumber: true })} /></Grid>
            <Grid size={6}>
              <Controller name="minSkillLevel" control={control}
                render={({ field }) => (
                  <FormControl fullWidth><InputLabel>Мин. ниво</InputLabel>
                    <Select {...field} label="Мин. ниво"><MenuItem value="">Без</MenuItem>
                      {SKILL_LEVELS.map(l => <MenuItem key={l} value={l}>{SKILL_LEVEL_LABELS[l]}</MenuItem>)}</Select>
                  </FormControl>
                )} />
            </Grid>
            <Grid size={12}>
              <Button fullWidth variant="contained" type="submit" disabled={isSubmitting} size="large">
                {isSubmitting ? 'Се зачувува...' : 'Зачувај промени'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
