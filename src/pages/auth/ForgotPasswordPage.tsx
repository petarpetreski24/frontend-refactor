import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Box, Paper, Typography, TextField, Button, Alert, Link } from '@mui/material';
import * as authApi from '../../api/auth';

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string }>();

  const onSubmit = async (data: { email: string }) => {
    try {
      await authApi.forgotPassword(data.email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Грешка при испраќање.');
    }
  };

  return (
    <Box display="flex" justifyContent="center" mt={8}>
      <Paper sx={{ p: 4, maxWidth: 420, width: '100%' }}>
        <Typography variant="h5" textAlign="center" mb={2}>Заборавена лозинка</Typography>
        {success ? (
          <Alert severity="success">Ако email адресата постои, ќе добиете линк за ресетирање. Проверете го MailHog на порт 8025.</Alert>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Typography variant="body2" mb={2}>Внесете ја вашата email адреса за да добиете линк за ресетирање.</Typography>
            <TextField fullWidth label="Email" {...register('email', { required: 'Email е задолжителен' })}
              error={!!errors.email} helperText={errors.email?.message} />
            <Button fullWidth variant="contained" type="submit" disabled={isSubmitting} sx={{ mt: 2 }}>Испрати</Button>
          </form>
        )}
        <Box textAlign="center" mt={2}>
          <Link component={RouterLink} to="/login">Назад кон најава</Link>
        </Box>
      </Paper>
    </Box>
  );
}
