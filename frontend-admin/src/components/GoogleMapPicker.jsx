import React, { useRef, useEffect } from 'react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCGacFvdCZP5AZSaQZ10TRtG30RDXftb1U'; // Thay bằng key thật

const GoogleMapPicker = ({ onAddressSelect }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 10.762622, lng: 106.660172 }, // Hồ Chí Minh
        zoom: 15,
      });
      map.addListener('click', (e) => {
        const latLng = e.latLng;
        if (markerRef.current) markerRef.current.setMap(null);
        markerRef.current = new window.google.maps.Marker({
          position: latLng,
          map,
        });
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: latLng }, (results, status) => {
          if (status === 'OK' && results[0]) {
            onAddressSelect(results[0].formatted_address);
          }
        });
      });
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [onAddressSelect]);

  return (
    <div>
      <div ref={mapRef} style={{ width: '100%', height: 320, borderRadius: 8, marginBottom: 16 }} />
      <div style={{color:'#888',fontSize:14}}>Nhấn vào bản đồ để chọn địa chỉ giao hàng.</div>
    </div>
  );
};

export default GoogleMapPicker;
