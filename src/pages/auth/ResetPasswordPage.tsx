import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import * as authApi from '../../api/auth';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<{ newPassword: string; confirm: string }>();

  const onSubmit = async (data: { newPassword: string }) => {
    try {
      await authApi.resetPassword({ token: searchParams.get('token') || '', newPassword: data.newPassword });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Грешка при ресетирање.');
    }
  };

  return (
    <Box display="flex" justifyContent="center" mt={8}>
      <Paper sx={{ p: 4, maxWidth: 420, width: '100%' }}>
        <Typography variant="h5" textAlign="center" mb={3}>Нова лозинка</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField fullWidth label="Нова лозинка" type="password" margin="normal"
            {...register('newPassword', { required: 'Задолжително', minLength: { value: 8, message: 'Минимум 8 карактери' } })}
            error={!!errors.newPassword} helperText={errors.newPassword?.message} />
          <TextField fullWidth label="Потврди лозинка" type="password" margin="normal"
            {...register('confirm', { validate: v => v === watch('newPassword') || 'Не се совпаѓаат' })}
            error={!!errors.confirm} helperText={errors.confirm?.message} />
          <Button fullWidth variant="contained" type="submit" disabled={isSubmitting} sx={{ mt: 2 }}>Промени лозинка</Button>
        </form>
      </Paper>
    </Box>
  );
}
