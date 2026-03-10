import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Box, Paper, Typography, TextField, Button, Alert, Link } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface FormData { firstName: string; lastName: string; email: string; password: string; confirmPassword: string; }

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      await registerUser(data.firstName, data.lastName, data.email, data.password);
      setSuccess('Регистрацијата е успешна! Проверете го вашиот email за потврда.');
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Грешка при регистрација.');
    }
  };

  return (
    <Box display="flex" justifyContent="center" mt={6}>
      <Paper sx={{ p: 4, maxWidth: 480, width: '100%' }}>
        <Typography variant="h5" textAlign="center" mb={3}>Регистрација</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box display="flex" gap={2}>
            <TextField fullWidth label="Име" margin="normal"
              {...register('firstName', { required: 'Името е задолжително' })}
              error={!!errors.firstName} helperText={errors.firstName?.message} />
            <TextField fullWidth label="Презиме" margin="normal"
              {...register('lastName', { required: 'Презимето е задолжително' })}
              error={!!errors.lastName} helperText={errors.lastName?.message} />
          </Box>
          <TextField fullWidth label="Email" margin="normal"
            {...register('email', { required: 'Email е задолжителен', pattern: { value: /^\S+@\S+$/i, message: 'Невалиден email' } })}
            error={!!errors.email} helperText={errors.email?.message} />
          <TextField fullWidth label="Лозинка" type="password" margin="normal"
            {...register('password', { required: 'Лозинката е задолжителна', minLength: { value: 8, message: 'Минимум 8 карактери' },
              pattern: { value: /^(?=.*[A-Z])(?=.*\d)/, message: 'Мора да содржи голема буква и цифра' } })}
            error={!!errors.password} helperText={errors.password?.message} />
          <TextField fullWidth label="Потврди лозинка" type="password" margin="normal"
            {...register('confirmPassword', { required: 'Потврдете ја лозинката',
              validate: (val) => val === watch('password') || 'Лозинките не се совпаѓаат' })}
            error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />
          <Button fullWidth variant="contained" type="submit" disabled={isSubmitting} sx={{ mt: 2, mb: 2 }}>
            {isSubmitting ? 'Се регистрира...' : 'Регистрирај се'}
          </Button>
        </form>
        <Typography variant="body2" textAlign="center">
          Веќе имате сметка? <Link component={RouterLink} to="/login">Најавете се</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
