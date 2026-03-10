import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Box, Typography, Paper, TextField, Button, FormControl, InputLabel, Select,
  MenuItem, Grid, Alert,
} from '@mui/material';
import { Sport, SKILL_LEVELS, SKILL_LEVEL_LABELS } from '../../types';
import * as sportsApi from '../../api/sports';
import * as eventsApi from '../../api/events';
import LocationPicker from '../../components/LocationPicker';

interface FormData {
  sportId: number; title: string; description: string; eventDate: string;
  durationMinutes: number; locationAddress: string; locationLat: number;
  locationLng: number; maxParticipants: number; minSkillLevel: string;
}

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [sports, setSports] = useState<Sport[]>([]);
  const [error, setError] = useState('');
  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: { durationMinutes: 60, maxParticipants: 10, locationLat: 41.9981, locationLng: 21.4254, locationAddress: '', minSkillLevel: '' },
  });

  const locationLat = watch('locationLat');
  const locationLng = watch('locationLng');
  const locationAddress = watch('locationAddress');

  useEffect(() => {
    sportsApi.getAll().then(({ data }) => setSports(data)).catch(() => {});
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      const result = await eventsApi.create({
        ...data,
        minSkillLevel: data.minSkillLevel || undefined,
      });
      navigate(`/events/${result.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Грешка при креирање.');
    }
  };

  const handleLocationChange = (lat: number, lng: number, address: string) => {
    setValue('locationLat', lat);
    setValue('locationLng', lng);
    setValue('locationAddress', address);
  };

  return (
    <Box maxWidth={700} mx="auto">
      <Typography variant="h4" gutterBottom>Креирај настан</Typography>
      <Paper sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Controller name="sportId" control={control} rules={{ required: 'Изберете спорт' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.sportId}>
                    <InputLabel>Спорт</InputLabel>
                    <Select {...field} label="Спорт">
                      {sports.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Наслов" {...register('title', { required: 'Задолжително' })}
                error={!!errors.title} helperText={errors.title?.message} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth multiline rows={4} label="Опис" {...register('description', { required: 'Задолжително' })}
                error={!!errors.description} helperText={errors.description?.message} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Датум и време" type="datetime-local" InputLabelProps={{ shrink: true }}
                {...register('eventDate', { required: 'Задолжително' })}
                error={!!errors.eventDate} helperText={errors.eventDate?.message} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Времетраење (минути)" type="number"
                {...register('durationMinutes', { required: 'Задолжително', min: { value: 15, message: 'Мин. 15 мин.' } })}
                error={!!errors.durationMinutes} helperText={errors.durationMinutes?.message} />
            </Grid>
            <Grid size={12}>
              <LocationPicker
                value={{ lat: locationLat, lng: locationLng, address: locationAddress }}
                onChange={handleLocationChange}
                label="Локација на настанот"
              />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Макс. учесници" type="number"
                {...register('maxParticipants', { required: 'Задолжително', min: { value: 2, message: 'Мин. 2' }, valueAsNumber: true })}
                error={!!errors.maxParticipants} helperText={errors.maxParticipants?.message} />
            </Grid>
            <Grid size={6}>
              <Controller name="minSkillLevel" control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Мин. ниво на вештина (опционално)</InputLabel>
                    <Select {...field} label="Мин. ниво на вештина (опционално)">
                      <MenuItem value="">Без ограничување</MenuItem>
                      {SKILL_LEVELS.map(l => <MenuItem key={l} value={l}>{SKILL_LEVEL_LABELS[l]}</MenuItem>)}
                    </Select>
                  </FormControl>
                )} />
            </Grid>
            <Grid size={12}>
              <Button fullWidth variant="contained" type="submit" disabled={isSubmitting} size="large">
                {isSubmitting ? 'Се креира...' : 'Креирај настан'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
