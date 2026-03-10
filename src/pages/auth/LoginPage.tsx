import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Box, Paper, Typography, TextField, Button, Alert, Link } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string; password: string }>();

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      setError('');
      await login(data.email, data.password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Неуспешна најава. Проверете ги вашите податоци.');
    }
  };

  return (
    <Box display="flex" justifyContent="center" mt={8}>
      <Paper sx={{ p: 4, maxWidth: 420, width: '100%' }}>
        <Typography variant="h5" textAlign="center" mb={3}>Најава</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField fullWidth label="Email" margin="normal"
            {...register('email', { required: 'Email е задолжителен' })}
            error={!!errors.email} helperText={errors.email?.message} />
          <TextField fullWidth label="Лозинка" type="password" margin="normal"
            {...register('password', { required: 'Лозинката е задолжителна' })}
            error={!!errors.password} helperText={errors.password?.message} />
          <Button fullWidth variant="contained" type="submit" disabled={isSubmitting} sx={{ mt: 2, mb: 2 }}>
            {isSubmitting ? 'Се најавува...' : 'Најави се'}
          </Button>
        </form>
        <Box textAlign="center">
          <Link component={RouterLink} to="/forgot-password" variant="body2">Заборавена лозинка?</Link>
          <Typography variant="body2" mt={1}>
            Немате сметка? <Link component={RouterLink} to="/register">Регистрирајте се</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
