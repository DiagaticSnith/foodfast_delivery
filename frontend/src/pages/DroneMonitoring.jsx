import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import { DroneSimulator, generateRoute, SAMPLE_LOCATIONS } from '../utils/droneSimulator';

const DroneMonitoring = () => {
  const navigate = useNavigate();
  const [drones, setDrones] = useState([]);
  const [orders, setOrders] = useState([]);
  const [simulators, setSimulators] = useState({});
  const [dronePositions, setDronePositions] = useState({});
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef({});
  const polylinesRef = useRef({});

  // Fetch drones and active orders
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [dronesRes, ordersRes] = await Promise.all([
        api.get('/api/drones'),
        api.get('/api/orders'),
      ]);
      setDrones(dronesRes.data || []);
  const activeOrders = (ordersRes.data || []).filter(o => o.status === 'Delivering' && o.droneId);
      setOrders(activeOrders);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  // Initialize Google Map
  useEffect(() => {
    if (!mapRef.current || googleMapRef.current) return;

  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCGacFvdCZP5AZSaQZ10TRtG30RDXftb1U&v=weekly&libraries=geometry&region=VN&language=vi`;
    script.async = true;
    script.onload = () => {
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: SAMPLE_LOCATIONS.center,
        zoom: 13,
        mapTypeId: 'roadmap',
      });
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Start simulations for active orders using real addresses (restaurant -> user)
  useEffect(() => {
    if (!googleMapRef.current || orders.length === 0) return;

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

    let active = true;
    const run = async () => {
      const newSimulators = {};
      const newPositions = {};
      for (const order of orders) {
        if (simulators[order.droneId]) continue; // Already simulating

        try {
          // Derive restaurantId from order details (first menu item)
          const detailRes = await api.get(`/api/order-details/${order.id}`);
          const details = detailRes.data || [];
          const firstMenu = details[0]?.Menu;
          const restaurantId = firstMenu?.restaurantId;

          let restaurantAddress = null;
          if (restaurantId) {
            try {
              const restRes = await api.get(`/api/restaurants/${restaurantId}`);
              restaurantAddress = restRes.data?.address || null;
            } catch (e) {
              console.warn('Lỗi lấy thông tin nhà hàng:', e?.message || e);
            }
          }

          // Geocode addresses
          let origin = null; // restaurant
          let dest = null;   // user address
          if (restaurantAddress) origin = await geocodeAddress(restaurantAddress);
          if (order.address) dest = await geocodeAddress(order.address);

          // Fallbacks
          if (!origin) origin = SAMPLE_LOCATIONS.restaurant1;
          if (!dest) {
            const customerLocations = [SAMPLE_LOCATIONS.customer1, SAMPLE_LOCATIONS.customer2, SAMPLE_LOCATIONS.customer3];
            dest = customerLocations[order.id % customerLocations.length];
          }

          const route = generateRoute(origin, dest, 30);

          const startMs = new Date(order.updatedAt || Date.now()).getTime();
          const durationMs = 120000; // 2 minutes demo flight
          const simulator = new DroneSimulator(order.droneId, route, { mode: 'time', startTimeMs: startMs, durationMs, tickHz: 30 });
          let orderCompleted = false;
          
          simulator.onUpdate((update) => {
            if (!active) return;
            setDronePositions(prev => ({
              ...prev,
              [order.droneId]: update
            }));
            updateMarker(order.droneId, update.position, update.bearing, order);
            
            if ((update.completed || update.progress >= 0.99) && !orderCompleted) {
              orderCompleted = true;
              console.log(`🎯 Drone #${order.droneId} reached destination (100%), updating order #${order.id} to Done`);
              completeOrder(order.id);
            }
          });

          simulator.start();
          newSimulators[order.droneId] = simulator;
          newPositions[order.droneId] = { position: route[0], bearing: 0 };
          drawRoute(order.droneId, route);
        } catch (e) {
          console.warn('Lỗi khởi tạo mô phỏng cho order', order.id, e);
        }
      }

      if (!active) return;
      setSimulators(prev => ({ ...prev, ...newSimulators }));
      setDronePositions(prev => ({ ...prev, ...newPositions }));
    };

    run();
    return () => {
      active = false;
      // Không stop tất cả simulator cũ ở đây để tránh giật; chỉ các sim mới tạo sẽ được cleanup khi effect reruns
    };
  }, [orders, googleMapRef.current]);

  const parseAddress = (address) => {
    // Simple parser - in production, use Google Geocoding API
    // For demo, return random customer location
    const locations = [SAMPLE_LOCATIONS.customer1, SAMPLE_LOCATIONS.customer2, SAMPLE_LOCATIONS.customer3];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  const completeOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      // Backend route là PUT /:id (không phải PATCH /:id/status)
      await api.put(`/api/orders/${orderId}`, 
        { status: 'Done' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(`Order #${orderId} status updated to Done`);
      // Refresh data
      setTimeout(() => {
        fetchData();
      }, 1000);
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const drawRoute = (droneId, route) => {
    if (!googleMapRef.current) return;

    if (polylinesRef.current[droneId]) {
      polylinesRef.current[droneId].setMap(null);
    }

    const polyline = new window.google.maps.Polyline({
      path: route,
      strokeColor: '#4285F4',
      strokeOpacity: 0.6,
      strokeWeight: 3,
      map: googleMapRef.current,
    });

    polylinesRef.current[droneId] = polyline;
  };

  const updateMarker = (droneId, position, bearing, order) => {
    if (!googleMapRef.current) return;

    if (!markersRef.current[droneId]) {
      const marker = new window.google.maps.Marker({
        position,
        map: googleMapRef.current,
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 7,
          fillColor: '#FF4D4F',
          fillOpacity: 1,
          strokeColor: '#FFF',
          strokeWeight: 2,
          rotation: bearing,
        },
        title: `Drone #${droneId} - Order #${order.id}`,
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h4 style="margin: 0 0 8px 0;">Drone #${droneId}</h4>
            <p style="margin: 0;"><b>Đơn hàng:</b> #${order.id}</p>
            <p style="margin: 0;"><b>Khách hàng:</b> ${order.User?.name || order.userId}</p>
            <p style="margin: 0;"><b>Địa chỉ:</b> ${order.address}</p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(googleMapRef.current, marker);
      });

      markersRef.current[droneId] = { marker, infoWindow };
    } else {
      const { marker } = markersRef.current[droneId];
      marker.setPosition(position);
      marker.setIcon({
        path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 7,
        fillColor: '#FF4D4F',
        fillOpacity: 1,
        strokeColor: '#FFF',
        strokeWeight: 2,
        rotation: bearing,
      });
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <button
          onClick={() => {
            if (window.history.length > 2) navigate(-1); else navigate('/admin-dashboard');
          }}
          style={{
            background: '#eee', border: '1px solid #ddd', color: '#333',
            borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 600
          }}
        >
          ← Quay lại
        </button>
        <h2 style={{ margin: 0 }}>🗺️ Giám sát Drone</h2>
        <div />
      </div>
      <p style={{ color: '#666', marginBottom: 16 }}>
        Theo dõi vị trí các drone đang giao hàng trên bản đồ (dữ liệu giả lập)
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16 }}>
        {/* Sidebar */}
        <div style={{ background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', height: 'fit-content' }}>
          <h3 style={{ marginTop: 0 }}>Drone hoạt động</h3>
          {orders.length === 0 ? (
            <p style={{ color: '#999' }}>Không có drone nào đang bay</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {orders.map(order => {
                const droneData = dronePositions[order.droneId];
                const progress = droneData ? Math.round(droneData.progress * 100) : 0;
                
                return (
                  <div key={order.droneId} style={{ 
                    padding: 12, 
                    background: '#f5f5f5', 
                    borderRadius: 6,
                    borderLeft: '4px solid #FF4D4F' 
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Drone #{order.droneId}</div>
                    <div style={{ fontSize: 14, color: '#666' }}>Đơn hàng: #{order.id}</div>
                    <div style={{ fontSize: 14, color: '#666' }}>Khách hàng: {order.User?.name || order.userId}</div>
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Tiến độ: {progress}%</div>
                      <div style={{ background: '#e0e0e0', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                        <div style={{ 
                          background: 'linear-gradient(90deg, #52c41a, #73d13d)', 
                          height: '100%', 
                          width: `${progress}%`,
                          transition: 'width 0.3s'
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #e0e0e0' }}>
            <h4 style={{ marginTop: 0 }}>Chú thích</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 16, height: 16, background: '#FF4D4F', borderRadius: '50%' }} />
              <span style={{ fontSize: 14 }}>Drone đang bay</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 16, height: 3, background: '#4285F4' }} />
              <span style={{ fontSize: 14 }}>Tuyến bay</span>
            </div>
          </div>
        </div>

        {/* Map */}
        <div style={{ 
          background: '#fff', 
          borderRadius: 8, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
          overflow: 'hidden',
          height: '600px'
        }}>
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    </div>
  );
};

export default DroneMonitoring;
