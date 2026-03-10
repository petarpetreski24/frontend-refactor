import { useState, useCallback, useRef } from 'react';
import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import { Box, TextField, Typography } from '@mui/material';

const containerStyle = {
  width: '100%',
  height: '350px',
  borderRadius: '8px',
};

const defaultCenter = {
  lat: 41.9981,
  lng: 21.4254,
};

interface LocationPickerProps {
  value?: { lat: number; lng: number; address: string };
  onChange: (lat: number, lng: number, address: string) => void;
  label?: string;
}

export default function LocationPicker({ value, onChange, label = 'Локација' }: LocationPickerProps) {
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number }>(
    value ? { lat: value.lat, lng: value.lng } : defaultCenter
  );
  const [address, setAddress] = useState(value?.address || '');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const getGeocoder = () => {
    if (!geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }
    return geocoderRef.current;
  };

  const reverseGeocode = useCallback(
    (lat: number, lng: number) => {
      const geocoder = getGeocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const addr = results[0].formatted_address;
          setAddress(addr);
          onChange(lat, lng, addr);
        } else {
          onChange(lat, lng, address);
        }
      });
    },
    [onChange, address]
  );

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarkerPos({ lat, lng });
        reverseGeocode(lat, lng);
      }
    },
    [reverseGeocode]
  );

  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarkerPos({ lat, lng });
        reverseGeocode(lat, lng);
      }
    },
    [reverseGeocode]
  );

  const handlePlaceChanged = useCallback(() => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const addr = place.formatted_address || place.name || '';
        setMarkerPos({ lat, lng });
        setAddress(addr);
        onChange(lat, lng, addr);
      }
    }
  }, [onChange]);

  const handleAutocompleteLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  }, []);

  const isGoogleMapsAvailable = typeof google !== 'undefined' && typeof google.maps !== 'undefined';

  if (!isGoogleMapsAvailable) {
    return (
      <Box>
        <Typography variant="subtitle2" gutterBottom>{label}</Typography>
        <TextField
          fullWidth
          label="Адреса"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            onChange(markerPos.lat, markerPos.lng, e.target.value);
          }}
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            label="Латитуда"
            type="number"
            value={markerPos.lat}
            onChange={(e) => {
              const lat = parseFloat(e.target.value) || 0;
              setMarkerPos((p) => ({ ...p, lat }));
              onChange(lat, markerPos.lng, address);
            }}
            fullWidth
          />
          <TextField
            label="Лонгитуда"
            type="number"
            value={markerPos.lng}
            onChange={(e) => {
              const lng = parseFloat(e.target.value) || 0;
              setMarkerPos((p) => ({ ...p, lng }));
              onChange(markerPos.lat, lng, address);
            }}
            fullWidth
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>{label}</Typography>
      <Autocomplete
        onLoad={handleAutocompleteLoad}
        onPlaceChanged={handlePlaceChanged}
        options={{ componentRestrictions: { country: 'mk' } }}
      >
        <TextField
          fullWidth
          label="Пребарај адреса"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Внесете адреса или име на локација..."
          sx={{ mb: 1 }}
        />
      </Autocomplete>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPos}
        zoom={14}
        onClick={handleMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        <Marker
          position={markerPos}
          draggable
          onDragEnd={handleMarkerDragEnd}
        />
      </GoogleMap>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        Кликнете на мапата или повлечете го маркерот за да ја изберете локацијата
      </Typography>
    </Box>
  );
}
