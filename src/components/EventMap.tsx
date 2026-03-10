import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { Box, Button, Typography, Chip } from '@mui/material';
import DirectionsIcon from '@mui/icons-material/Directions';
import PlaceIcon from '@mui/icons-material/Place';
import { useState } from 'react';

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px',
};

interface EventMapProps {
  lat: number;
  lng: number;
  address: string;
  title?: string;
  userLat?: number;
  userLng?: number;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.asin(Math.sqrt(a));
  return R * c;
}

export default function EventMap({ lat, lng, address, title, userLat, userLng }: EventMapProps) {
  const [showInfo, setShowInfo] = useState(false);

  const distance = userLat && userLng ? calculateDistance(userLat, userLng, lat, lng) : null;

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const isGoogleMapsAvailable = typeof google !== 'undefined' && typeof google.maps !== 'undefined';

  if (!isGoogleMapsAvailable) {
    return (
      <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <PlaceIcon color="error" />
          <Typography variant="body1">{address}</Typography>
        </Box>
        {distance !== null && (
          <Chip
            label={`${distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`} од вас`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ mb: 1 }}
          />
        )}
        <Button
          variant="contained"
          startIcon={<DirectionsIcon />}
          onClick={handleGetDirections}
          size="small"
        >
          Направи рута
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{ lat, lng }}
        zoom={15}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        <Marker
          position={{ lat, lng }}
          onClick={() => setShowInfo(true)}
        />
        {showInfo && (
          <InfoWindow
            position={{ lat, lng }}
            onCloseClick={() => setShowInfo(false)}
          >
            <Box sx={{ p: 0.5 }}>
              {title && <Typography variant="subtitle2">{title}</Typography>}
              <Typography variant="body2">{address}</Typography>
            </Box>
          </InfoWindow>
        )}
      </GoogleMap>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
        <Button
          variant="contained"
          startIcon={<DirectionsIcon />}
          onClick={handleGetDirections}
          size="small"
        >
          Направи рута
        </Button>
        {distance !== null && (
          <Chip
            label={`${distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`} од вас`}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
      </Box>
    </Box>
  );
}
