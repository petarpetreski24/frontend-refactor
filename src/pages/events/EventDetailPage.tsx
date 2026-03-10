import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Paper, Button, Chip, Avatar, Rating, Divider,
  CircularProgress, Alert, TextField, Card, CardContent, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, List, ListItem, ListItemAvatar, ListItemText,
} from '@mui/material';
import { Event as EventIcon, Place, Timer, Person, CheckCircle, Cancel, Send, Delete } from '@mui/icons-material';
import { SportEvent, EventApplication, EventComment, EventRating, RatableParticipant } from '../../types';
import * as eventsApi from '../../api/events';
import * as applicationsApi from '../../api/applications';
import * as commentsApi from '../../api/comments';
import * as ratingsApi from '../../api/ratings';
import { useAuth } from '../../contexts/AuthContext';
import { EVENT_STATUS_LABELS, SKILL_LEVEL_LABELS } from '../../types';
import EventMap from '../../components/EventMap';
import dayjs from 'dayjs';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<SportEvent | null>(null);
  const [applications, setApplications] = useState<EventApplication[]>([]);
  const [myApplication, setMyApplication] = useState<EventApplication | null>(null);
  const [comments, setComments] = useState<EventComment[]>([]);
  const [ratings, setRatings] = useState<EventRating[]>([]);
  const [ratableParticipants, setRatableParticipants] = useState<RatableParticipant[]>([]);
  const [newComment, setNewComment] = useState('');
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [removeDialog, setRemoveDialog] = useState<{ userId: number; userName: string } | null>(null);
  const [removeReason, setRemoveReason] = useState('');
  const [peerRatings, setPeerRatings] = useState<Record<number, { rating: number; comment: string }>>({});
  const [error, setError] = useState('');

  const isOrganizer = user?.id === event?.organizerId;
  const isApproved = myApplication?.status === 'Approved' || isOrganizer;
  const hasActiveApplication = myApplication?.status === 'Pending' || myApplication?.status === 'Approved';
  const isCompleted = event?.status === 'Completed';
  const canRate = isCompleted && isApproved && !ratings.some(r => r.reviewerId === user?.id) &&
    dayjs().diff(dayjs(event?.eventDate).add(event?.durationMinutes || 0, 'minute'), 'day') <= 7;

  const load = async () => {
    if (!id) return;
    try {
      const { data: ev } = await eventsApi.getById(parseInt(id));
      setEvent(ev);
      const isOrg = user?.id === ev.organizerId;
      if (isAuthenticated) {
        if (isOrg) {
          try { const { data: apps } = await applicationsApi.getEventApplications(parseInt(id)); setApplications(apps); } catch { }
        } else {
          try { const { data: myApp } = await applicationsApi.getMyApplication(parseInt(id)); setMyApplication(myApp || null); } catch { }
        }
        try { const { data: cmts } = await commentsApi.getComments(parseInt(id)); setComments(cmts); } catch { }
        if (ev.status === 'Completed') {
          try { const { data: rp } = await ratingsApi.getRatableParticipants(parseInt(id)); setRatableParticipants(rp); } catch { }
        }
      }
      try { const { data: rats } = await ratingsApi.getEventRatings(parseInt(id)); setRatings(rats); } catch { }
    } catch { setError('Настанот не е пронајден.'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id, isAuthenticated]);

  const handleApply = async () => {
    if (!id) return;
    try { await applicationsApi.apply(parseInt(id)); load(); } catch (e: any) { setError(e.response?.data?.error || 'Грешка'); }
  };

  const handleCancelApplication = async () => {
    if (!id || !myApplication) return;
    try {
      await applicationsApi.cancelApplication(parseInt(id), myApplication.id);
      setMyApplication(null);
      load();
    } catch (e: any) { setError(e.response?.data?.error || 'Грешка при откажување на пријавата.'); }
  };

  const handleCancel = async () => {
    if (!id) return;
    await eventsApi.cancel(parseInt(id));
    setCancelDialog(false);
    load();
  };

  const handleAddComment = async () => {
    if (!id || !newComment.trim()) return;
    await commentsApi.createComment(parseInt(id), newComment);
    setNewComment('');
    load();
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!id) return;
    try {
      await commentsApi.deleteComment(parseInt(id), commentId);
      load();
    } catch (e: any) { setError(e.response?.data?.error || 'Грешка при бришење на коментар.'); }
  };

  const handleRate = async () => {
    if (!id || !ratingValue) return;
    await ratingsApi.rateEvent(parseInt(id), { rating: ratingValue, comment: ratingComment || undefined });
    setRatingValue(0);
    setRatingComment('');
    load();
  };

  const handleRateParticipant = async (participantId: number) => {
    if (!id) return;
    const pr = peerRatings[participantId];
    if (!pr?.rating) return;
    try {
      await ratingsApi.rateParticipant(parseInt(id), { participantId, rating: pr.rating, comment: pr.comment || undefined });
      setPeerRatings(prev => { const n = { ...prev }; delete n[participantId]; return n; });
      load();
    } catch (e: any) { setError(e.response?.data?.error || 'Грешка при оценување.'); }
  };

  const handleRemoveParticipant = async () => {
    if (!id || !removeDialog) return;
    try {
      await applicationsApi.removeParticipant(parseInt(id), removeDialog.userId, removeReason || undefined);
      setRemoveDialog(null);
      setRemoveReason('');
      load();
    } catch (e: any) { setError(e.response?.data?.error || 'Грешка'); }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  if (!event) return <Alert severity="error">Настанот не е пронајден.</Alert>;

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" gap={1}>
                <Chip label={event.sportName} color="primary" />
                <Chip label={EVENT_STATUS_LABELS[event.status] || event.status}
                  color={event.status === 'Open' ? 'success' : event.status === 'Full' ? 'warning' : 'default'} />
              </Box>
              {isOrganizer && event.status !== 'Completed' && event.status !== 'Cancelled' && (
                <Box>
                  <Button size="small" onClick={() => navigate(`/events/${id}/edit`)}>Уреди</Button>
                  <Button size="small" color="error" onClick={() => setCancelDialog(true)}>Откажи</Button>
                </Box>
              )}
            </Box>
            <Typography variant="h4" gutterBottom>{event.title}</Typography>
            <Grid container spacing={2} mb={2}>
              <Grid size={6}><Box display="flex" alignItems="center" gap={1}><EventIcon color="action" /><Typography>{dayjs(event.eventDate).format('DD.MM.YYYY HH:mm')}</Typography></Box></Grid>
              <Grid size={6}><Box display="flex" alignItems="center" gap={1}><Timer color="action" /><Typography>{event.durationMinutes} минути</Typography></Box></Grid>
              <Grid size={12}><Box display="flex" alignItems="center" gap={1}><Place color="action" /><Typography>{event.locationAddress}</Typography></Box></Grid>
              <Grid size={6}><Box display="flex" alignItems="center" gap={1}><Person color="action" /><Typography>{event.currentParticipants}/{event.maxParticipants} учесници</Typography></Box></Grid>
              {event.minSkillLevel && (
                <Grid size={6}><Typography variant="body2">Мин. ниво: {SKILL_LEVEL_LABELS[event.minSkillLevel] || event.minSkillLevel}</Typography></Grid>
              )}
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{event.description}</Typography>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>Локација</Typography>
              <EventMap lat={event.locationLat} lng={event.locationLng} address={event.locationAddress}
                title={event.title} userLat={user?.locationLat ?? undefined} userLng={user?.locationLng ?? undefined} />
            </Box>

            {isAuthenticated && !isOrganizer && event.status === 'Open' && !hasActiveApplication && (
              <Button variant="contained" color="secondary" fullWidth sx={{ mt: 3 }} onClick={handleApply}>Пријави се</Button>
            )}
            {myApplication && (
              <Alert severity={myApplication.status === 'Approved' ? 'success' : myApplication.status === 'Pending' ? 'info' : 'warning'} sx={{ mt: 2 }}
                action={hasActiveApplication ? (<Button size="small" color="inherit" onClick={handleCancelApplication}>Откажи пријава</Button>) : undefined}>
                Статус на пријавата: <strong>{myApplication.status === 'Approved' ? 'Одобрена ✓' : myApplication.status === 'Pending' ? 'Чека одобрување...' : myApplication.status === 'Rejected' ? 'Одбиена' : 'Откажана'}</strong>
              </Alert>
            )}
          </Paper>

          {/* Comments */}
          {isApproved && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Коментари</Typography>
              {comments.length === 0 && <Typography variant="body2" color="text.secondary" mb={2}>Нема коментари сè уште.</Typography>}
              {comments.map(c => (
                <Box key={c.id} sx={{ mb: 2, display: 'flex', gap: 1.5 }}>
                  <Avatar src={c.userPhotoUrl} sx={{ width: 32, height: 32 }}>{c.userName[0]}</Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle2">{c.userName}{' '}
                      <Typography component="span" variant="caption" color="text.secondary">{dayjs(c.createdAt).format('DD.MM HH:mm')}</Typography>
                    </Typography>
                    <Typography variant="body2">{c.content}</Typography>
                  </Box>
                  {(c.userId === user?.id || isOrganizer) && (
                    <IconButton size="small" color="error" onClick={() => handleDeleteComment(c.id)} title="Избриши коментар"><Delete fontSize="small" /></IconButton>
                  )}
                </Box>
              ))}
              <Box display="flex" gap={1} mt={2}>
                <TextField fullWidth size="small" placeholder="Напиши коментар..." value={newComment} onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddComment()} />
                <IconButton color="primary" onClick={handleAddComment}><Send /></IconButton>
              </Box>
            </Paper>
          )}

          {/* Event Ratings */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Оценки за настанот {event.avgRating && `(${event.avgRating.toFixed(1)})`}</Typography>
            {ratings.length === 0 && <Typography variant="body2" color="text.secondary">Нема оценки сè уште.</Typography>}
            {ratings.map(r => (
              <Box key={r.id} sx={{ mb: 2 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle2">{r.reviewerName}</Typography>
                  <Rating value={r.rating} readOnly size="small" />
                  <Typography variant="caption" color="text.secondary">{dayjs(r.createdAt).format('DD.MM.YYYY')}</Typography>
                </Box>
                {r.comment && <Typography variant="body2" mt={0.5}>{r.comment}</Typography>}
              </Box>
            ))}
            {canRate && (
              <Box mt={2} p={2} bgcolor="grey.50" borderRadius={2}>
                <Typography variant="subtitle2" mb={1}>Оцени го настанот</Typography>
                <Rating value={ratingValue} onChange={(_, v) => setRatingValue(v || 0)} />
                <TextField fullWidth size="small" placeholder="Коментар (опционално)" value={ratingComment}
                  onChange={e => setRatingComment(e.target.value)} sx={{ mt: 1 }} />
                <Button variant="contained" size="small" onClick={handleRate} disabled={!ratingValue} sx={{ mt: 1 }}>Испрати оценка</Button>
              </Box>
            )}
          </Paper>

          {/* Peer Rating */}
          {isCompleted && ratableParticipants.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Оцени учесници</Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>Оценете ги учесниците со кои игравте на овој настан.</Typography>
              {ratableParticipants.map(p => (
                <Box key={p.userId} sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <Avatar src={p.userPhotoUrl} sx={{ width: 36, height: 36 }}>{p.userName[0]}</Avatar>
                    <Box>
                      <Typography variant="subtitle2">{p.userName}</Typography>
                      {p.avgRating != null && <Typography variant="caption" color="text.secondary">{p.avgRating.toFixed(1)} ★</Typography>}
                    </Box>
                  </Box>
                  <Rating value={peerRatings[p.userId]?.rating || 0}
                    onChange={(_, v) => setPeerRatings(prev => ({ ...prev, [p.userId]: { rating: v || 0, comment: prev[p.userId]?.comment || '' } }))} />
                  <TextField fullWidth size="small" placeholder="Коментар (опционално)" sx={{ mt: 1 }}
                    value={peerRatings[p.userId]?.comment || ''}
                    onChange={e => setPeerRatings(prev => ({ ...prev, [p.userId]: { rating: prev[p.userId]?.rating || 0, comment: e.target.value } }))} />
                  <Button variant="contained" size="small" sx={{ mt: 1 }} disabled={!peerRatings[p.userId]?.rating}
                    onClick={() => handleRateParticipant(p.userId)}>Оцени</Button>
                </Box>
              ))}
            </Paper>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 3, cursor: 'pointer' }} onClick={() => navigate(`/users/${event.organizerId}`)}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Организатор</Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar src={event.organizerPhotoUrl} sx={{ width: 48, height: 48 }}>{event.organizerName[0]}</Avatar>
                <Box>
                  <Typography fontWeight={600}>{event.organizerName}</Typography>
                  {event.organizerRating && <Rating value={event.organizerRating} readOnly size="small" precision={0.5} />}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {isOrganizer && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Пријави ({applications.length})</Typography>
              <List dense>
                {applications.map(app => (
                  <ListItem key={app.id} secondaryAction={
                    app.status === 'Pending' ? (
                      <Box>
                        <IconButton size="small" color="success" onClick={() => applicationsApi.approve(event.id, app.id).then(load)}><CheckCircle /></IconButton>
                        <IconButton size="small" color="error" onClick={() => applicationsApi.reject(event.id, app.id).then(load)}><Cancel /></IconButton>
                      </Box>
                    ) : app.status === 'Approved' ? (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Chip size="small" label="Одобрен" color="success" />
                        <IconButton size="small" color="error" title="Отстрани учесник"
                          onClick={() => setRemoveDialog({ userId: app.userId, userName: app.userName })}><Delete fontSize="small" /></IconButton>
                      </Box>
                    ) : <Chip size="small" label={app.status === 'Rejected' ? 'Одбиен' : app.status} />
                  }>
                    <ListItemAvatar><Avatar src={app.userPhotoUrl}>{app.userName[0]}</Avatar></ListItemAvatar>
                    <ListItemText primary={app.userName} secondary={app.userAvgRating ? `${app.userAvgRating.toFixed(1)} ★` : undefined} />
                  </ListItem>
                ))}
                {applications.length === 0 && <Typography variant="body2" color="text.secondary">Нема пријави.</Typography>}
              </List>
            </Paper>
          )}
        </Grid>
      </Grid>

      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)}>
        <DialogTitle>Откажи настан?</DialogTitle>
        <DialogContent><Typography>Сите пријавени учесници ќе бидат известени за откажувањето.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)}>Не</Button>
          <Button onClick={handleCancel} color="error" variant="contained">Откажи настан</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!removeDialog} onClose={() => { setRemoveDialog(null); setRemoveReason(''); }}>
        <DialogTitle>Отстрани учесник</DialogTitle>
        <DialogContent>
          <Typography mb={2}>Дали сте сигурни дека сакате да го отстраните <strong>{removeDialog?.userName}</strong>?</Typography>
          <TextField fullWidth label="Причина (опционално)" value={removeReason}
            onChange={e => setRemoveReason(e.target.value)} placeholder="Наведете причина за отстранување..." />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRemoveDialog(null); setRemoveReason(''); }}>Откажи</Button>
          <Button onClick={handleRemoveParticipant} color="error" variant="contained">Отстрани</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
