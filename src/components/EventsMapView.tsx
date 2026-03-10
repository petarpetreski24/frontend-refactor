import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { Box, Typography, Button, Chip } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SportEvent } from '../types';
import dayjs from 'dayjs';

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '8px',
};

const defaultCenter = {
  lat: 41.9981,
  lng: 21.4254,
};

interface EventsMapViewProps {
  events: SportEvent[];
}

export default function EventsMapView({ events }: EventsMapViewProps) {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<SportEvent | null>(null);

  const center = events.length > 0
    ? {
        lat: events.reduce((sum, e) => sum + e.locationLat, 0) / events.length,
        lng: events.reduce((sum, e) => sum + e.locationLng, 0) / events.length,
      }
    : defaultCenter;

  const isGoogleMapsAvailable = typeof google !== 'undefined' && typeof google.maps !== 'undefined';

  if (!isGoogleMapsAvailable) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Google Maps не е достапен. Поставете го VITE_GOOGLE_MAPS_API_KEY во .env датотеката.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={events.length > 0 ? 10 : 8}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            position={{ lat: event.locationLat, lng: event.locationLng }}
            onClick={() => setSelectedEvent(event)}
            title={event.title}
          />
        ))}
        {selectedEvent && (
          <InfoWindow
            position={{ lat: selectedEvent.locationLat, lng: selectedEvent.locationLng }}
            onCloseClick={() => setSelectedEvent(null)}
          >
            <Box sx={{ p: 0.5, maxWidth: 250 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{selectedEvent.title}</Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5, flexWrap: 'wrap' }}>
                <Chip label={selectedEvent.sportName} size="small" color="primary" variant="outlined" />
                <Chip label={selectedEvent.status} size="small" />
              </Box>
              <Typography variant="caption" display="block">
                📅 {dayjs(selectedEvent.eventDate).format('DD.MM.YYYY HH:mm')}
              </Typography>
              <Typography variant="caption" display="block">
                📍 {selectedEvent.locationAddress}
              </Typography>
              <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                👥 {selectedEvent.currentParticipants}/{selectedEvent.maxParticipants}
              </Typography>
              <Button
                size="small"
                variant="contained"
                onClick={() => navigate(`/events/${selectedEvent.id}`)}
                fullWidth
              >
                Детали
              </Button>
            </Box>
          </InfoWindow>
        )}
      </GoogleMap>
    </Box>
  );
}
