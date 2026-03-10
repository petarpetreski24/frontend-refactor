import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Paper, Avatar, Button, Grid, Chip, Rating, Divider,
  CircularProgress, Alert, List, ListItem, ListItemText,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../../contexts/AuthContext';
import * as usersApi from '../../api/users';
import { SKILL_LEVEL_LABELS } from '../../types';

interface FavSport { sportId: number; sportName: string; skillLevel: string }

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [favSports, setFavSports] = useState<FavSport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshUser();
    usersApi.getFavoriteSports()
      .then(res => setFavSports(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !user) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  return (
    <Box maxWidth={800} mx="auto">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Мој профил</Typography>
        <Button variant="outlined" startIcon={<EditIcon />} component={RouterLink} to="/profile/edit">
          Уреди профил
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }} display="flex" flexDirection="column" alignItems="center">
            <Avatar
              src={user.profilePhotoUrl ? `http://localhost:5000${user.profilePhotoUrl}` : undefined}
              sx={{ width: 120, height: 120, mb: 2, fontSize: 48 }}
            >
              {user.firstName?.[0]}{user.lastName?.[0]}
            </Avatar>
            <Typography variant="h6">{user.firstName} {user.lastName}</Typography>
            <Typography color="text.secondary">{user.email}</Typography>
            {user.phone && <Typography color="text.secondary">{user.phone}</Typography>}
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            {user.bio && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">Биографија</Typography>
                <Typography>{user.bio}</Typography>
              </Box>
            )}
            {user.locationCity && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">Град</Typography>
                <Typography>{user.locationCity}</Typography>
              </Box>
            )}
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid size={6}>
                <Typography variant="subtitle2" color="text.secondary">Рејтинг како организатор</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Rating value={user.avgRatingAsOrganizer || 0} precision={0.5} readOnly size="small" />
                  <Typography variant="body2">({(user.avgRatingAsOrganizer || 0).toFixed(1)})</Typography>
                </Box>
              </Grid>
              <Grid size={6}>
                <Typography variant="subtitle2" color="text.secondary">Рејтинг како учесник</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Rating value={user.avgRatingAsParticipant || 0} precision={0.5} readOnly size="small" />
                  <Typography variant="body2">({(user.avgRatingAsParticipant || 0).toFixed(1)})</Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Омилени спортови</Typography>
        {favSports.length === 0 ? (
          <Alert severity="info">Немате додадено омилени спортови. Уредете го профилот за да додадете.</Alert>
        ) : (
          <List>
            {favSports.map(fs => (
              <ListItem key={fs.sportId}>
                <ListItemText
                  primary={fs.sportName}
                  secondary={`Ниво: ${SKILL_LEVEL_LABELS[fs.skillLevel] || fs.skillLevel}`}
                />
                <Chip label={SKILL_LEVEL_LABELS[fs.skillLevel] || fs.skillLevel} size="small" />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}
