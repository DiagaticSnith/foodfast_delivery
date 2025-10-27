import React, { useRef, useEffect, useState } from 'react';

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
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#fff',borderRadius:12,padding:24,minWidth:400,maxWidth:600,boxShadow:'0 2px 8px #aaa',position:'relative'}}>
        <h3 style={{marginBottom:16}}>Chọn vị trí giao hàng</h3>
        <div ref={mapRef} style={{ width: '100%', height: 320, borderRadius: 8, marginBottom: 16 }} />
        <div style={{color:'#888',fontSize:14,marginBottom:8}}>Gõ để tìm địa chỉ (Places API New) hoặc nhấn vào bản đồ để chọn vị trí.</div>
        <div style={{position:'relative'}}>
          <input ref={inputRef} type="text" value={address} onChange={onChangeAddress} style={{width:'100%',padding:'10px',fontSize:16,borderRadius:6,border:'1px solid #eee'}} placeholder="Nhập địa chỉ..." />
          {(suggestions.length > 0 || loadingSuggestions) && (
            <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#fff',border:'1px solid #eee',borderTop:'none',zIndex:10,maxHeight:220,overflowY:'auto',borderBottomLeftRadius:6,borderBottomRightRadius:6}}>
              {loadingSuggestions && <div style={{padding:10,fontSize:14,color:'#888'}}>Đang gợi ý...</div>}
              {suggestions.map((s, i) => (
                <div key={s.placeId+String(i)} onClick={()=>selectSuggestion(s)} style={{padding:'10px 12px',cursor:'pointer'}} onMouseDown={e=>e.preventDefault()}>
                  {s.text}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:12}}>
          <button onClick={onClose} style={{background:'#eee',color:'#333',border:'none',borderRadius:6,padding:'10px 24px',fontSize:16}}>Hủy</button>
          <button onClick={() => { if(address) { console.log('Xác nhận địa chỉ:', address); onConfirm(address); } }} disabled={!address} style={{background:'#ff4d4f',color:'#fff',border:'none',borderRadius:6,padding:'10px 24px',fontSize:16,cursor:address?'pointer':'not-allowed'}}>Xác nhận</button>
        </div>
        {loading && <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(255,255,255,0.7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>Đang tải bản đồ...</div>}
      </div>
    </div>
  );
};

export default MapModal;
