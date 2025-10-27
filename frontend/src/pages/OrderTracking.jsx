import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/api';
import { DroneSimulator, generateRoute, SAMPLE_LOCATIONS } from '../utils/droneSimulator';
import StatusBadge from '../components/StatusBadge';

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [restaurantAddress, setRestaurantAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dronePosition, setDronePosition] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const droneMarkerRef = useRef(null);
  const restaurantMarkerRef = useRef(null);
  const customerMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const simulatorRef = useRef(null);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setError('Không có mã đơn hàng trong URL');
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/api/orders`);
      const foundOrder = (res.data || []).find(o => o.id === parseInt(orderId));
      if (foundOrder) {
        setOrder(foundOrder);
        // Fetch order details to derive restaurantId
        try {
          const detailRes = await api.get(`/api/order-details/${foundOrder.id}`);
          const details = detailRes.data || [];
          setOrderDetails(details);
          const firstMenu = details[0]?.Menu;
          const restaurantId = firstMenu?.restaurantId;
          if (restaurantId) {
            try {
              const restRes = await api.get(`/api/restaurants/${restaurantId}`);
              setRestaurantAddress(restRes.data?.address || null);
            } catch (e) {
              console.warn('Không lấy được địa chỉ nhà hàng, fallback sample:', e?.message || e);
              setRestaurantAddress(null);
            }
          }
        } catch (e) {
          console.warn('Không lấy được chi tiết đơn hàng để suy ra nhà hàng:', e?.message || e);
        }
      } else {
        setError(`Không tìm thấy đơn hàng #${orderId}`);
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Lỗi khi tải thông tin đơn hàng: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize Google Map
  useEffect(() => {
    console.log('Map init useEffect - mapRef.current:', !!mapRef.current, 'googleMapRef.current:', !!googleMapRef.current);
    
    if (!mapRef.current) {
      console.log('mapRef.current is null, will retry on next render');
      // Set a small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if (mapRef.current && !googleMapRef.current) {
          initMap();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
    
    if (googleMapRef.current) {
      console.log('Google Maps already initialized');
      return;
    }

    initMap();
  }, [mapRef.current]);

  const initMap = () => {
    // Check if Google Maps script already exists
    if (window.google && window.google.maps) {
      console.log('Google Maps already loaded from another source');
      try {
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          center: SAMPLE_LOCATIONS.center,
          zoom: 14,
          mapTypeId: 'roadmap',
        });
        setMapLoaded(true);
        console.log('Google Maps initialized successfully');
      } catch (err) {
        console.error('Error initializing Google Maps:', err);
      }
      return;
    }

  console.log('Loading Google Maps script...');
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCGacFvdCZP5AZSaQZ10TRtG30RDXftb1U&v=weekly&region=VN&language=vi`;
    script.async = true;
    script.onload = () => {
      console.log('Google Maps script loaded');
      try {
        if (mapRef.current) {
          googleMapRef.current = new window.google.maps.Map(mapRef.current, {
            center: SAMPLE_LOCATIONS.center,
            zoom: 14,
            mapTypeId: 'roadmap',
          });
          setMapLoaded(true);
          console.log('Google Maps initialized successfully');
        }
      } catch (err) {
        console.error('Error initializing Google Maps:', err);
        setError('Lỗi khi tải bản đồ. Vui lòng kiểm tra API key.');
      }
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
      setError('Không thể tải Google Maps. Vui lòng kiểm tra kết nối mạng hoặc API key.');
    };
    document.head.appendChild(script);
  };

  // Helper: geocode address -> { lat, lng }
  const geocodeAddress = async (address) => {
    if (!address) return null;
    if (!(window.google && window.google.maps)) return null;
    const cacheKey = `geo:${address}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const p = JSON.parse(cached);
        if (p && typeof p.lat === 'number' && typeof p.lng === 'number') return p;
      }
    } catch {}
    return new Promise((resolve) => {
      try {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address, componentRestrictions: { country: 'VN' } }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const loc = results[0].geometry.location;
            const point = { lat: loc.lat(), lng: loc.lng() };
            try { localStorage.setItem(cacheKey, JSON.stringify(point)); } catch {}
            resolve(point);
          } else {
            console.warn('Geocode thất bại:', status, address);
            resolve(null);
          }
        });
      } catch (e) {
        console.warn('Geocode error:', e);
        resolve(null);
      }
    });
  };

  // Start simulation when order + addresses are ready
  useEffect(() => {
    console.log('Simulation useEffect - order:', order?.id, 'status:', order?.status, 'droneId:', order?.droneId, 'googleMapRef:', !!googleMapRef.current, 'mapLoaded:', mapLoaded);
    
  // Chỉ chạy simulation khi đơn ở trạng thái Delivering
  if (!order || !googleMapRef.current || order.status !== 'Delivering') {
      console.log('Skipping simulation - order status is:', order?.status);
      // Dừng simulator nếu đang chạy
      if (simulatorRef.current) {
        simulatorRef.current.stop();
        simulatorRef.current = null;
      }
      // Xóa saved progress nếu đơn đã Done
      if (order?.status === 'Done') {
        localStorage.removeItem(`drone_progress_${order.id}`);
        console.log('🗑️ Cleared saved progress for completed order');
      }
      return;
    }

    console.log('Starting drone simulation for order', order.id);

    // Resolve start/end from real addresses
    const run = async () => {
      // Geocode addresses: restaurant origin and order address destination
      let restaurantPoint = null;
      let customerPoint = null;
      if (restaurantAddress) {
        restaurantPoint = await geocodeAddress(restaurantAddress);
      }
      if (order.address) {
        customerPoint = await geocodeAddress(order.address);
      }

      // Fallbacks to sample if geocoding fails
      if (!restaurantPoint) restaurantPoint = SAMPLE_LOCATIONS.restaurant1;
      if (!customerPoint) {
        const customerLocations = [SAMPLE_LOCATIONS.customer1, SAMPLE_LOCATIONS.customer2, SAMPLE_LOCATIONS.customer3];
        customerPoint = customerLocations[order.id % customerLocations.length];
      }

      console.log('Route (real): Restaurant', restaurantPoint, '→ Customer', customerPoint);
      const route = generateRoute(restaurantPoint, customerPoint, 40);

      // Draw route
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
      polylineRef.current = new window.google.maps.Polyline({
        path: route,
        strokeColor: '#52c41a',
        strokeOpacity: 0.7,
        strokeWeight: 4,
        map: googleMapRef.current,
      });

      // Add restaurant marker
      // Add restaurant marker (larger icon)
      if (!restaurantMarkerRef.current) {
        restaurantMarkerRef.current = new window.google.maps.Marker({
          position: restaurantPoint,
          map: googleMapRef.current,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#FF4D4F" stroke="white" stroke-width="2"/>
                <text x="20" y="26" font-size="20" text-anchor="middle" fill="white">🏪</text>
              </svg>
            `),
            anchor: new window.google.maps.Point(20, 20),
          },
          title: 'Nhà hàng',
        });
      } else {
        restaurantMarkerRef.current.setPosition(restaurantPoint);
      }

      // Add customer marker
      // Add customer marker (larger icon)
      if (!customerMarkerRef.current) {
        customerMarkerRef.current = new window.google.maps.Marker({
          position: customerPoint,
          map: googleMapRef.current,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#52c41a" stroke="white" stroke-width="2"/>
                <text x="20" y="26" font-size="20" text-anchor="middle" fill="white">📍</text>
              </svg>
            `),
            anchor: new window.google.maps.Point(20, 20),
          },
          title: 'Địa chỉ giao hàng',
        });
      } else {
        customerMarkerRef.current.setPosition(customerPoint);
      }

      // Fit map to show route
      const bounds = new window.google.maps.LatLngBounds();
      route.forEach(point => bounds.extend(point));
      googleMapRef.current.fitBounds(bounds);

      // Start drone simulation
      if (simulatorRef.current) {
        simulatorRef.current.stop();
      }

      // Load saved progress từ localStorage
      const savedProgressKey = `drone_progress_${order.id}`;
      const savedData = localStorage.getItem(savedProgressKey);
      let startIndex = 0;
      let startProgress = 0;
      
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          startIndex = parsed.currentIndex || 0;
          startProgress = parsed.progress || 0;
          console.log('📂 Restored simulation progress:', { startIndex, startProgress });
        } catch (e) {
          console.error('Error parsing saved progress:', e);
        }
      }

      // Time-based simulator: start at order.updatedAt (when set to Delivering), duration ~ 2 minutes
      const startMs = new Date(order.updatedAt || Date.now()).getTime();
      const durationMs = 120000; // 2 minutes for demo
      const simulator = new DroneSimulator(order.droneId, route, { mode: 'time', startTimeMs: startMs, durationMs, tickHz: 30 });
    
      // Set vị trí bắt đầu từ progress đã lưu
      if (startIndex > 0 || startProgress > 0) {
        simulator.currentIndex = startIndex;
        simulator.progress = startProgress;
      }
      
      let orderCompleted = false; // Flag để tránh gọi nhiều lần
      
      simulator.onUpdate((update) => {
        console.log('Drone update - progress:', Math.round(update.progress * 100) + '%');
        setDronePosition(update);
        updateDroneMarker(update.position, update.bearing);
        
        // Optional: keep last known info (not required with time-based mode)
        localStorage.setItem(savedProgressKey, JSON.stringify({ t: update.progress, ts: Date.now() }));
        
        // Khi đạt 100%, tự động cập nhật đơn sang Done
        if ((update.completed || update.progress >= 0.99) && !orderCompleted) {
          orderCompleted = true;
          console.log('🎯 Drone reached destination (100%), updating order status to Done');
          // Xóa saved progress
          localStorage.removeItem(savedProgressKey);
          completeOrder(order.id);
        }
      });
      simulator.start();
      simulatorRef.current = simulator;
      console.log('Drone simulator started for order', order.id);
    };
    run();

    return () => {
      if (simulatorRef.current) {
        simulatorRef.current.stop();
      }
    };
  }, [order, mapLoaded, restaurantAddress]);

  const parseAddress = (address) => {
    const locations = [SAMPLE_LOCATIONS.customer1, SAMPLE_LOCATIONS.customer2, SAMPLE_LOCATIONS.customer3];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  const completeOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔄 Calling API to mark order as Done...', { orderId, hasToken: !!token });
      
      // Backend route là PUT /:id (không phải PATCH /:id/status)
      const response = await api.put(`/api/orders/${orderId}`, 
        { status: 'Done' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('✅ Order status updated successfully:', response.data);
      
      // Refresh order data sau 500ms
      setTimeout(() => {
        fetchOrder();
      }, 500);
    } catch (err) {
      console.error('❌ Error updating order status:', err.response?.data || err.message);
      alert('Lỗi khi cập nhật trạng thái đơn hàng: ' + (err.response?.data?.message || err.message));
    }
  };

  const updateDroneMarker = (position, bearing) => {
    if (!googleMapRef.current) return;

    if (!droneMarkerRef.current) {
      droneMarkerRef.current = new window.google.maps.Marker({
        position,
        map: googleMapRef.current,
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 8,
          fillColor: '#1890ff',
          fillOpacity: 1,
          strokeColor: '#FFF',
          strokeWeight: 2,
          rotation: bearing,
        },
        title: `Drone #${order?.droneId}`,
        zIndex: 1000,
      });
    } else {
      droneMarkerRef.current.setPosition(position);
      droneMarkerRef.current.setIcon({
        path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
  scale: 8,
        fillColor: '#1890ff',
        fillOpacity: 1,
        strokeColor: '#FFF',
        strokeWeight: 2,
        rotation: bearing,
      });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <div style={{ fontSize: 18, color: '#666' }}>Đang tải thông tin đơn hàng...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <div style={{ fontSize: 18, color: '#ff4d4f', marginBottom: 16 }}>❌ {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            padding: '10px 20px', 
            background: '#1890ff', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 8, 
            cursor: 'pointer' 
          }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <div style={{ fontSize: 18, color: '#666' }}>Không tìm thấy đơn hàng</div>
      </div>
    );
  }

  const progress = (dronePosition && dronePosition.progress !== undefined) 
    ? Math.round(dronePosition.progress * 100) 
    : 0;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h2>📦 Theo dõi đơn hàng #{order.id}</h2>
      
      {/* Order info */}
      <div style={{ 
        background: '#fff', 
        padding: 24, 
        borderRadius: 12, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: 24 
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div>
            <div style={{ fontSize: 14, color: '#999', marginBottom: 4 }}>Trạng thái</div>
            <StatusBadge status={order.status} />
          </div>
          <div>
            <div style={{ fontSize: 14, color: '#999', marginBottom: 4 }}>Tổng tiền</div>
            <div style={{ fontSize: 18, fontWeight: 'bold' }}>{Number(order.total).toLocaleString()}₫</div>
          </div>
          <div>
            <div style={{ fontSize: 14, color: '#999', marginBottom: 4 }}>Địa chỉ giao hàng</div>
            <div style={{ fontSize: 16 }}>{order.address}</div>
          </div>
          {order.droneId && (
            <div>
              <div style={{ fontSize: 14, color: '#999', marginBottom: 4 }}>Drone giao hàng</div>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: '#1890ff' }}>Drone #{order.droneId}</div>
            </div>
          )}
        </div>
      </div>

      {/* Delivery status */}
      {order.status === 'Delivering' && dronePosition && (
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: '#fff',
          padding: 24, 
          borderRadius: 12, 
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 16, opacity: 0.9 }}>Drone đang trên đường giao hàng</div>
              <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 4 }}>{progress}% hoàn thành</div>
            </div>
            <div style={{ fontSize: 48 }}>🚁</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: 8, height: 12, overflow: 'hidden' }}>
            <div style={{ 
              background: '#fff', 
              height: '100%', 
              width: `${progress}%`,
              transition: 'width 0.5s',
              borderRadius: 8
            }} />
          </div>
        </div>
      )}

      {order.status === 'Pending' && (
        <div style={{ 
          background: '#fff3cd', 
          border: '1px solid #ffc107',
          color: '#856404',
          padding: 16, 
          borderRadius: 8, 
          marginBottom: 24,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 16, fontWeight: 'bold' }}>⏳ Đơn hàng đang chờ nhà hàng xác nhận</div>
          <div style={{ fontSize: 14, marginTop: 4 }}>Drone sẽ bắt đầu di chuyển sau khi nhà hàng chấp nhận đơn</div>
        </div>
      )}

      {order.status === 'Done' && (
        <div style={{ 
          background: '#d4edda', 
          border: '1px solid #28a745',
          color: '#155724',
          padding: 16, 
          borderRadius: 8, 
          marginBottom: 24,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 16, fontWeight: 'bold' }}>✅ Đơn hàng đã được giao thành công!</div>
          <div style={{ fontSize: 14, marginTop: 4 }}>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi</div>
        </div>
      )}

      {/* Map */}
      <div style={{ 
        background: '#fff', 
        borderRadius: 12, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
        overflow: 'hidden',
        height: '500px',
        position: 'relative'
      }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        {!mapLoaded && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f5f5',
            fontSize: 16,
            color: '#999'
          }}>
            🗺️ Đang tải bản đồ...
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ 
        background: '#fff', 
        padding: 16, 
        borderRadius: 8, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginTop: 16,
        display: 'flex',
        gap: 32,
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 24 }}>🏪</div>
          <span>Nhà hàng</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, background: '#1890ff', borderRadius: '50%' }} />
          <span>Drone đang bay</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 24 }}>📍</div>
          <span>Địa chỉ giao hàng</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 4, background: '#52c41a' }} />
          <span>Tuyến bay</span>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
