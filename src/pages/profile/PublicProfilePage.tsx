import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Avatar, Grid, Rating, Divider,
  CircularProgress, Alert, List, ListItem, ListItemText, Chip,
} from '@mui/material';
import * as usersApi from '../../api/users';
import { SKILL_LEVEL_LABELS, UserPublic } from '../../types';

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<UserPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    usersApi.getPublicProfile(parseInt(id!))
      .then(res => setProfile(res.data))
      .catch(() => setError('Корисникот не е пронајден.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!profile) return null;

  return (
    <Box maxWidth={700} mx="auto">
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }} display="flex" flexDirection="column" alignItems="center">
            <Avatar
              src={profile.profilePhotoUrl ? `http://localhost:5000${profile.profilePhotoUrl}` : undefined}
              sx={{ width: 120, height: 120, mb: 2, fontSize: 48 }}
            >
              {profile.firstName?.[0]}{profile.lastName?.[0]}
            </Avatar>
            <Typography variant="h5">{profile.firstName} {profile.lastName}</Typography>
            {profile.locationCity && (
              <Typography color="text.secondary">{profile.locationCity}</Typography>
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            {profile.bio && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">Биографија</Typography>
                <Typography>{profile.bio}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid size={6}>
                <Typography variant="subtitle2" color="text.secondary">Рејтинг како организатор</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Rating value={profile.avgRatingAsOrganizer || 0} precision={0.5} readOnly size="small" />
                  <Typography variant="body2">({(profile.avgRatingAsOrganizer || 0).toFixed(1)})</Typography>
                </Box>
              </Grid>
              <Grid size={6}>
                <Typography variant="subtitle2" color="text.secondary">Рејтинг како учесник</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Rating value={profile.avgRatingAsParticipant || 0} precision={0.5} readOnly size="small" />
                  <Typography variant="body2">({(profile.avgRatingAsParticipant || 0).toFixed(1)})</Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {profile.favoriteSports && profile.favoriteSports.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Спортови</Typography>
          <List>
            {profile.favoriteSports.map((fs, i) => (
              <ListItem key={i}>
                <ListItemText primary={fs.sportName} />
                <Chip label={SKILL_LEVEL_LABELS[fs.skillLevel] || fs.skillLevel} size="small" />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
