import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Box, Typography, Paper, TextField, Button, Grid, Alert, Avatar,
  IconButton, CircularProgress, Divider, FormControl, InputLabel,
  Select, MenuItem, Chip,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../contexts/AuthContext';
import * as usersApi from '../../api/users';
import * as sportsApi from '../../api/sports';
import { Sport, SKILL_LEVELS, SKILL_LEVEL_LABELS } from '../../types';
import LocationPicker from '../../components/LocationPicker';

interface ProfileForm {
  firstName: string; lastName: string; phone: string;
  bio: string; locationCity: string; locationLat: number; locationLng: number;
}

interface FavSport { sportId: number; sportName: string; skillLevel: string }

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [sports, setSports] = useState<Sport[]>([]);
  const [favSports, setFavSports] = useState<FavSport[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSportId, setNewSportId] = useState<number | ''>('');
  const [newSkillLevel, setNewSkillLevel] = useState('Beginner');

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    defaultValues: {
      firstName: user?.firstName || '', lastName: user?.lastName || '',
      phone: user?.phone || '', bio: user?.bio || '',
      locationCity: user?.locationCity || '',
      locationLat: user?.locationLat || 0, locationLng: user?.locationLng || 0,
    }
  });

  useEffect(() => {
    Promise.all([sportsApi.getAll(), usersApi.getFavoriteSports()])
      .then(([sRes, fRes]) => { setSports(sRes.data); setFavSports(fRes.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data: ProfileForm) => {
    try {
      await usersApi.updateProfile(data);
      await refreshUser();
      navigate('/profile');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Грешка при ажурирање на профил.');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    try {
      await usersApi.uploadPhoto(formData);
      await refreshUser();
    } catch {
      setError('Грешка при прикачување на слика.');
    }
  };

  const addFavSport = async () => {
    if (!newSportId) return;
    try {
      await usersApi.addFavoriteSport(newSportId as number, newSkillLevel);
      const res = await usersApi.getFavoriteSports();
      setFavSports(res.data);
      setNewSportId('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Грешка при додавање спорт.');
    }
  };

  const removeFavSport = async (sportId: number) => {
    try {
      await usersApi.removeFavoriteSport(sportId);
      setFavSports(prev => prev.filter(f => f.sportId !== sportId));
    } catch {
      setError('Грешка при бришење.');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  return (
    <Box maxWidth={700} mx="auto">
      <Typography variant="h4" gutterBottom>Уреди профил</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar
            src={user?.profilePhotoUrl ? `http://localhost:5000${user.profilePhotoUrl}` : undefined}
            sx={{ width: 80, height: 80, fontSize: 32 }}
          >
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          <Button variant="outlined" component="label" startIcon={<PhotoCameraIcon />}>
            Промени слика
            <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
          </Button>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField fullWidth label="Име" {...register('firstName', { required: 'Задолжително' })}
                error={!!errors.firstName} helperText={errors.firstName?.message} />
            </Grid>
            <Grid size={6}>
              <TextField fullWidth label="Презиме" {...register('lastName', { required: 'Задолжително' })}
                error={!!errors.lastName} helperText={errors.lastName?.message} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Телефон" {...register('phone')} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth multiline rows={3} label="Биографија" {...register('bio')} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Град" {...register('locationCity')} />
            </Grid>
            <Grid size={12}>
              <LocationPicker
                value={{ lat: watch('locationLat') || 41.9981, lng: watch('locationLng') || 21.4254, address: watch('locationCity') || '' }}
                onChange={(lat, lng, address) => {
                  setValue('locationLat', lat);
                  setValue('locationLng', lng);
                  setValue('locationCity', address.split(',')[0]?.trim() || address);
                }}
                label="Моја локација"
              />
            </Grid>
            <Grid size={12}>
              <Button fullWidth variant="contained" type="submit" disabled={isSubmitting} size="large">
                {isSubmitting ? 'Се зачувува...' : 'Зачувај'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Омилени спортови</Typography>
        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          {favSports.map(fs => (
            <Chip
              key={fs.sportId}
              label={`${fs.sportName} - ${SKILL_LEVEL_LABELS[fs.skillLevel] || fs.skillLevel}`}
              onDelete={() => removeFavSport(fs.sportId)}
              deleteIcon={<DeleteIcon />}
            />
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" gutterBottom>Додади спорт</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid size={5}>
            <FormControl fullWidth size="small">
              <InputLabel>Спорт</InputLabel>
              <Select value={newSportId} onChange={e => setNewSportId(e.target.value as number)} label="Спорт">
                {sports.filter(s => !favSports.some(f => f.sportId === s.id)).map(s => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Ниво</InputLabel>
              <Select value={newSkillLevel} onChange={e => setNewSkillLevel(e.target.value)} label="Ниво">
                {SKILL_LEVELS.map(l => <MenuItem key={l} value={l}>{SKILL_LEVEL_LABELS[l]}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={3}>
            <Button fullWidth variant="outlined" onClick={addFavSport} disabled={!newSportId}>
              Додади
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
