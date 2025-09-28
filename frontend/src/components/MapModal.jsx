import React, { useRef, useEffect, useState } from 'react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCGacFvdCZP5AZSaQZ10TRtG30RDXftb1U'; // Thay bằng key thật

const MapModal = ({ open, onClose, onConfirm }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAddress('');
    setLoading(true);
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => {
      setLoading(false);
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 10.762622, lng: 106.660172 },
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
            setAddress(results[0].formatted_address);
            console.log('Địa chỉ chọn:', results[0].formatted_address);
          }
        });
      });
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [open]);

  if (!open) return null;

  return (
    <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#fff',borderRadius:12,padding:24,minWidth:400,maxWidth:600,boxShadow:'0 2px 8px #aaa',position:'relative'}}>
        <h3 style={{marginBottom:16}}>Chọn vị trí giao hàng</h3>
        <div ref={mapRef} style={{ width: '100%', height: 320, borderRadius: 8, marginBottom: 16 }} />
        <div style={{color:'#888',fontSize:14,marginBottom:8}}>Nhấn vào bản đồ để chọn vị trí.</div>
        <input type="text" value={address} readOnly style={{width:'100%',padding:'10px',fontSize:16,borderRadius:6,border:'1px solid #eee',marginBottom:16}} placeholder="Địa chỉ sẽ hiển thị ở đây..." />
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
