import { useEffect, useState } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Box, Paper, Typography, CircularProgress, Alert, Button } from '@mui/material';
import * as authApi from '../../api/auth';

export default function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      authApi.confirmEmail(token)
        .then(() => setSuccess(true))
        .catch((err) => setError(err.response?.data?.error || 'Невалиден или истечен токен.'))
        .finally(() => setLoading(false));
    } else {
      setError('Нема токен за потврда.');
      setLoading(false);
    }
  }, [searchParams]);

  return (
    <Box display="flex" justifyContent="center" mt={8}>
      <Paper sx={{ p: 4, maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <Typography variant="h5" mb={3}>Потврда на email</Typography>
        {loading && <CircularProgress />}
        {success && <Alert severity="success">Email адресата е успешно потврдена!</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && <Button component={RouterLink} to="/login" variant="contained" sx={{ mt: 2 }}>Кон најава</Button>}
      </Paper>
    </Box>
  );
}
