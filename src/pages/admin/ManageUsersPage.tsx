import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Chip, IconButton, FormControl,
  InputLabel, Select, MenuItem, TablePagination, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import * as adminApi from '../../api/admin';

interface AdminUser {
  id: number; firstName: string; lastName: string; email: string;
  role: string; isActive: boolean; emailConfirmed: boolean;
  createdAt: string; eventsOrganized: number; eventsParticipated: number;
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: string; userId: number; userName: string }>({
    open: false, type: '', userId: 0, userName: '',
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers(search, roleFilter, page + 1, pageSize);
      setUsers(res.data.items);
      setTotalCount(res.data.totalCount);
    } catch {
      setError('Грешка при вчитување на корисници.');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page, pageSize]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAction = async () => {
    const { type, userId } = confirmDialog;
    try {
      if (type === 'deactivate') await adminApi.deactivateUser(userId);
      else if (type === 'delete') await adminApi.deleteUser(userId);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Грешка при извршување.');
    }
    setConfirmDialog({ open: false, type: '', userId: 0, userName: '' });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Управување со корисници</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField size="small" label="Пребарај" value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }} sx={{ minWidth: 200 }} />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Улога</InputLabel>
          <Select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(0); }} label="Улога">
            <MenuItem value="">Сите</MenuItem>
            <MenuItem value="User">Корисник</MenuItem>
            <MenuItem value="Admin">Админ</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Име</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Улога</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Настани</TableCell>
                <TableCell align="right">Акции</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.firstName} {u.lastName}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip label={u.role === 'Admin' ? 'Админ' : 'Корисник'}
                      color={u.role === 'Admin' ? 'primary' : 'default'} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip label={u.isActive ? 'Активен' : 'Деактивиран'}
                      color={u.isActive ? 'success' : 'error'} size="small" />
                  </TableCell>
                  <TableCell>{u.eventsOrganized} орг. / {u.eventsParticipated} уч.</TableCell>
                  <TableCell align="right">
                    {u.isActive && u.role !== 'Admin' && (
                      <IconButton size="small" color="warning" title="Деактивирај"
                        onClick={() => setConfirmDialog({ open: true, type: 'deactivate', userId: u.id, userName: `${u.firstName} ${u.lastName}` })}>
                        <BlockIcon />
                      </IconButton>
                    )}
                    {u.role !== 'Admin' && (
                      <IconButton size="small" color="error" title="Избриши"
                        onClick={() => setConfirmDialog({ open: true, type: 'delete', userId: u.id, userName: `${u.firstName} ${u.lastName}` })}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination component="div" count={totalCount} page={page} rowsPerPage={pageSize}
            onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={e => { setPageSize(parseInt(e.target.value)); setPage(0); }}
            labelRowsPerPage="По страница:" rowsPerPageOptions={[10, 20, 50]} />
        </TableContainer>
      )}

      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}>
        <DialogTitle>
          {confirmDialog.type === 'deactivate' ? 'Деактивирај корисник' : 'Избриши корисник'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Дали сте сигурни дека сакате да {confirmDialog.type === 'deactivate' ? 'го деактивирате' : 'го избришете'} корисникот {confirmDialog.userName}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>Откажи</Button>
          <Button onClick={handleAction} color="error" variant="contained">
            {confirmDialog.type === 'deactivate' ? 'Деактивирај' : 'Избриши'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
