import React, { useRef, useEffect, useState } from 'react';
import '../styles/MapModal.css';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCGacFvdCZP5AZSaQZ10TRtG30RDXftb1U'; // Thay bằng key thật

const MapModal = ({ open, onClose, onConfirm }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [address, setAddress] = useState('');
  const inputRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const sessionTokenRef = useRef('');
  const debounceTimerRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
  setAddress('');
  setSuggestions([]);
  // Tạo session token cho Places (New)
  sessionTokenRef.current = Math.random().toString(36).slice(2) + Date.now();
    setLoading(true);
    const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=weekly&libraries=places&region=VN&language=vi`;
    script.async = true;
    script.onload = () => {
      setLoading(false);
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 10.762622, lng: 106.660172 },
        zoom: 15,
      });
      // Autocomplete (New) sẽ được thực hiện qua Places API (New) bằng fetch
      // Ở đây ta chỉ khởi tạo map; phần gợi ý xử lý trong onChange bên dưới
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
            setAddress(results[0].formatted_address);
            console.log('Địa chỉ chọn:', results[0].formatted_address);
          }
        });
      });
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [open]);

  const fetchSuggestions = async (text) => {
    if (!text || text.length < 3) { setSuggestions([]); return; }
    setLoadingSuggestions(true);
    try {
      const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text',
        },
        body: JSON.stringify({
          input: text,
          languageCode: 'vi',
          regionCode: 'VN',
          sessionToken: sessionTokenRef.current,
        })
      });
      const data = await res.json();
      const items = (data?.suggestions || [])
        .map(s => ({
          placeId: s.placePrediction?.placeId,
          text: s.placePrediction?.text?.text || '',
        }))
        .filter(s => s.placeId && s.text);
      setSuggestions(items);
    } catch (e) {
      console.warn('Autocomplete (New) error:', e);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const onChangeAddress = (e) => {
    const val = e.target.value;
    setAddress(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => fetchSuggestions(val), 250);
  };

  const selectSuggestion = async (sugg) => {
    try {
      const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(sugg.placeId)}`, {
        headers: {
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location',
        },
      });
      const data = await res.json();
      const formatted = data?.formattedAddress || data?.displayName?.text || sugg.text;
      setAddress(formatted || sugg.text);
      setSuggestions([]);
      if (data?.location && window.google && window.google.maps && mapRef.current) {
        const latLng = { lat: data.location.latitude, lng: data.location.longitude };
        const map = markerRef.current?.getMap() || new window.google.maps.Map(mapRef.current, {
          center: latLng,
          zoom: 16,
        });
        map.setCenter(latLng);
        map.setZoom(16);
        if (markerRef.current) markerRef.current.setMap(null);
        markerRef.current = new window.google.maps.Marker({ position: latLng, map });
      }
    } catch (e) {
      console.warn('Place details (New) error:', e);
    }
  };

  if (!open) return null;

  return (
    <div className="map-modal-overlay">
      <div className="map-modal-container">
        {/* Header */}
        <div className="map-modal-header">
          <h3 className="modal-title">
            <span className="modal-icon">🗺️</span>
            <span>Chọn vị trí giao hàng</span>
          </h3>
          <button className="close-button" onClick={onClose}>
            <span className="close-icon">✕</span>
          </button>
        </div>

        {/* Map Container */}
        <div className="map-container">
          <div ref={mapRef} className="google-map" />
          <div className="map-instructions">
            <span className="instruction-icon">📍</span>
            <span>Nhập địa chỉ hoặc nhấn vào bản đồ để chọn vị trí</span>
          </div>
        </div>

        {/* Address Input */}
        <div className="address-section">
          <div className="input-container">
            <input 
              ref={inputRef} 
              type="text" 
              value={address} 
              onChange={onChangeAddress} 
              className="address-input"
              placeholder="Nhập địa chỉ cụ thể..."
            />
            <div className="input-icon">
              <span>🔍</span>
            </div>
          </div>
          
          {/* Suggestions Dropdown */}
          {(suggestions.length > 0 || loadingSuggestions) && (
            <div className="suggestions-dropdown">
              {loadingSuggestions && (
                <div className="suggestion-item loading">
                  <span className="loading-icon">⏳</span>
                  <span>Đang tìm kiếm...</span>
                </div>
              )}
              {suggestions.map((s, i) => (
                <div 
                  key={s.placeId+String(i)} 
                  onClick={()=>selectSuggestion(s)} 
                  className="suggestion-item"
                  onMouseDown={e=>e.preventDefault()}
                >
                  <span className="suggestion-icon">📍</span>
                  <span className="suggestion-text">{s.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button onClick={onClose} className="modal-btn modal-btn--cancel">
            <span className="btn-icon">❌</span>
            <span>Hủy bỏ</span>
          </button>
          <button 
            onClick={() => { 
              if(address) { 
                console.log('Xác nhận địa chỉ:', address); 
                onConfirm(address); 
              } 
            }} 
            disabled={!address} 
            className={`modal-btn modal-btn--confirm ${!address ? 'disabled' : ''}`}
          >
            <span className="btn-icon">✅</span>
            <span>Xác nhận</span>
          </button>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="loading-spinner"></div>
              <span className="loading-text">Đang tải bản đồ...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapModal;
