import { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Button, TextField, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, Alert, Switch, FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import * as sportsApi from '../../api/sports';
import { Sport } from '../../types';

export default function ManageSportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; sport?: Sport }>({
    open: false, mode: 'add',
  });
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('');

  const fetchSports = async () => {
    try {
      const res = await sportsApi.getAll();
      setSports(res.data);
    } catch {
      setError('Грешка при вчитување.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSports(); }, []);

  const openAdd = () => {
    setFormName(''); setFormIcon('');
    setDialog({ open: true, mode: 'add' });
  };

  const openEdit = (sport: Sport) => {
    setFormName(sport.name); setFormIcon(sport.icon || '');
    setDialog({ open: true, mode: 'edit', sport });
  };

  const handleSave = async () => {
    try {
      if (dialog.mode === 'add') {
        await sportsApi.create({ name: formName, icon: formIcon });
      } else if (dialog.sport) {
        await sportsApi.update(dialog.sport.id, { name: formName, icon: formIcon });
      }
      setDialog({ open: false, mode: 'add' });
      fetchSports();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Грешка при зачувување.');
    }
  };

  const toggleActive = async (sport: Sport) => {
    try {
      await sportsApi.update(sport.id, { name: sport.name, icon: sport.icon, isActive: !sport.isActive });
      fetchSports();
    } catch {
      setError('Грешка при ажурирање.');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Управување со спортови</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
          Додади спорт
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Икона</TableCell>
              <TableCell>Име</TableCell>
              <TableCell>Активен</TableCell>
              <TableCell align="right">Акции</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sports.map(s => (
              <TableRow key={s.id}>
                <TableCell>{s.id}</TableCell>
                <TableCell sx={{ fontSize: 24 }}>{s.icon || '🏅'}</TableCell>
                <TableCell>{s.name}</TableCell>
                <TableCell>
                  <Switch checked={s.isActive !== false} onChange={() => toggleActive(s)} />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(s)} title="Уреди">
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialog.open} onClose={() => setDialog({ ...dialog, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>{dialog.mode === 'add' ? 'Додади спорт' : 'Уреди спорт'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Име на спорт" value={formName}
            onChange={e => setFormName(e.target.value)} sx={{ mt: 1, mb: 2 }} />
          <TextField fullWidth label="Икона (емоџи)" value={formIcon}
            onChange={e => setFormIcon(e.target.value)}
            helperText="Пример: ⚽, 🏀, 🏐" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ ...dialog, open: false })}>Откажи</Button>
          <Button variant="contained" onClick={handleSave} disabled={!formName.trim()}>
            {dialog.mode === 'add' ? 'Додади' : 'Зачувај'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
