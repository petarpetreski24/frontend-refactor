import { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Switch, FormControlLabel, Button, CircularProgress, Alert, Divider,
} from '@mui/material';
import { NotificationPreference } from '../../types';
import * as notificationsApi from '../../api/notifications';

const PREF_LABELS: { key: keyof NotificationPreference; label: string }[] = [
  { key: 'emailOnApplication', label: 'Е-пошта за нова пријава на настан' },
  { key: 'emailOnApproval', label: 'Е-пошта кога пријавата е одобрена/одбиена' },
  { key: 'emailOnEventUpdate', label: 'Е-пошта кога настанот е ажуриран' },
  { key: 'emailOnEventReminder', label: 'Е-пошта потсетник пред настан' },
  { key: 'emailOnNewComment', label: 'Е-пошта за нов коментар на настан' },
];

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    notificationsApi.getPreferences()
      .then(res => setPreferences(res.data))
      .catch(() => {
        // If no preferences exist yet, set defaults
        setPreferences({
          emailOnApplication: true,
          emailOnApproval: true,
          emailOnEventUpdate: true,
          emailOnEventReminder: true,
          emailOnNewComment: true,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (key: keyof NotificationPreference) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: !preferences[key] });
    setSuccess(false);
  };

  const handleSave = async () => {
    if (!preferences) return;
    setSaving(true);
    setError('');
    try {
      await notificationsApi.updatePreferences(preferences);
      setSuccess(true);
    } catch {
      setError('Грешка при зачувување на поставките.');
    }
    setSaving(false);
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  return (
    <Box maxWidth={600} mx="auto">
      <Typography variant="h4" gutterBottom>Поставки за нотификации</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Изберете кои е-пошта нотификации сакате да ги примате.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Поставките се зачувани успешно!</Alert>}

      <Paper sx={{ p: 3 }}>
        {preferences && PREF_LABELS.map(({ key, label }, i) => (
          <Box key={key}>
            {i > 0 && <Divider sx={{ my: 1 }} />}
            <FormControlLabel
              control={<Switch checked={preferences[key]} onChange={() => handleToggle(key)} />}
              label={label}
              sx={{ width: '100%', my: 0.5 }}
            />
          </Box>
        ))}

        <Box mt={3}>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Зачувување...' : 'Зачувај поставки'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
