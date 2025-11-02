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
  const [mapReady, setMapReady] = useState(false);
  const simulatorsRef = useRef({});
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
  // mark map as ready so effects depending on the map can run reliably
  console.debug('[DroneMonitoring] Google Maps loaded');
  setMapReady(true);
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Geocode helper (shared) - uses local cache to avoid repeated requests
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

  // Restaurant icon helper - returns a data URL SVG pin colored by `color`
  const getRestaurantIcon = (size = 36, color = '#34A853') => {
    // simple pin SVG with a fork/knife-like glyph (stylized)
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 24 24'>
        <path fill='${color}' d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'/>
        <path fill='#fff' d='M10.5 7.5h1v6h-1zM13.5 7.5h1v6h-1z' opacity='0.95'/>
      </svg>
    `.trim();
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  // Start simulations for active orders using real addresses (restaurant -> user)
  useEffect(() => {
    if (!mapReady || orders.length === 0) return;

    let active = true;
    let createdIds = [];

    const run = async () => {
      const newSimulators = {};
      const newPositions = {};
      createdIds = [];

      for (const order of orders) {
        if (simulatorsRef.current[order.droneId]) continue; // Already simulating

        try {
          // Derive restaurantId from order details (first menu item)
          const detailRes = await api.get(`/api/order-details/${order.id}`);
          const details = detailRes.data || [];
          const firstMenu = details[0]?.Menu;
          const restaurantId = firstMenu?.restaurantId;

          let restaurantAddress = null;
          let restaurant = null;
          if (restaurantId) {
            try {
              const restRes = await api.get(`/api/restaurants/${restaurantId}`);
              restaurant = restRes.data || null;
              restaurantAddress = restaurant?.address || null;
            } catch (e) {
              console.warn('Lỗi lấy thông tin nhà hàng:', e?.message || e);
            }
          }

          // Geocode addresses
          let origin = null; // restaurant
          let dest = null;   // user address
          if (restaurantAddress) {
            origin = await geocodeAddress(restaurantAddress);
            console.debug(`[DroneMonitoring] geocoded restaurant ${restaurantId} ->`, origin);
          }
          if (order.address) dest = await geocodeAddress(order.address);

          // Fallbacks
          if (!origin) origin = SAMPLE_LOCATIONS.restaurant1;

          // Add a marker for the restaurant (origin)
          try {
            if (restaurant && origin && restaurantId) {
              const restKey = `rest_${restaurantId}`;
              if (!markersRef.current[restKey]) {
                const restIconUrl = getRestaurantIcon(36, '#34A853');
                const restMarker = new window.google.maps.Marker({
                  position: origin,
                  map: googleMapRef.current,
                  title: restaurant.name || `Nhà hàng #${restaurantId}`,
                  icon: {
                    url: restIconUrl,
                    scaledSize: new window.google.maps.Size(36, 36),
                    anchor: new window.google.maps.Point(18, 36),
                  },
                });

                const restInfo = new window.google.maps.InfoWindow({
                  content: `
                    <div style="padding:8px;">
                      <h4 style="margin:0 0 6px 0;">${(restaurant.name||'Nhà hàng').replace(/</g,'&lt;')}</h4>
                      <div style="font-size:13px;color:#555;">${(restaurant.address||'Không rõ địa chỉ').replace(/</g,'&lt;')}</div>
                    </div>
                  `,
                });

                restMarker.addListener('click', () => restInfo.open(googleMapRef.current, restMarker));
                markersRef.current[restKey] = { marker: restMarker, infoWindow: restInfo };
                console.debug('[DroneMonitoring] added restaurant marker', restKey, origin);
              }
            }
          } catch (e) {
            console.warn('Không thể thêm marker nhà hàng:', e);
          }

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
            console.debug(`[DroneMonitoring] simulator update drone=${order.droneId} progress=${(update.progress*100).toFixed(2)} completed=${update.completed}`);
            setDronePositions(prev => ({ ...prev, [order.droneId]: update }));
            updateMarker(order.droneId, update.position, update.bearing, order);

            if ((update.completed || update.progress >= 0.99) && !orderCompleted) {
              orderCompleted = true;
              console.log(`🎯 Drone #${order.droneId} reached destination (100%), updating order #${order.id} to Done`);
              completeOrder(order.id);
            }
          });

          simulator.start();
          console.debug('[DroneMonitoring] started simulator for drone', order.droneId);
          newSimulators[order.droneId] = simulator;
          simulatorsRef.current[order.droneId] = simulator; // keep fast-ref
          createdIds.push(order.droneId);
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
      // stop only simulators that were created by this run to avoid stopping global ones
      try {
        if (Array.isArray(createdIds)) {
          createdIds.forEach(id => {
            try {
              const s = simulatorsRef.current[id];
              if (s && s.stop) {
                console.debug('[DroneMonitoring] stopping simulator (cleanup) for', id);
                s.stop();
              }
              delete simulatorsRef.current[id];
            } catch (e) { console.warn('Error stopping simulator during cleanup', id, e); }
          });
          // remove them from state too
          setSimulators(prev => {
            const copy = { ...prev };
            createdIds.forEach(id => delete copy[id]);
            return copy;
          });
        }
      } catch (e) { console.warn('Error in simulators cleanup', e); }
    };
  }, [orders, mapReady]);

  // Fetch and display all restaurants on the map (larger markers) so admins can see them
  useEffect(() => {
    if (!mapReady) return;

    let active = true;
    const loadRestaurants = async () => {
      try {
        const res = await api.get('/api/restaurants');
        const restaurants = res.data || [];
        for (const r of restaurants) {
          if (!active) break;
          const restId = r.id || r.restaurantId || r._id;
          if (!restId) continue;
          const restKey = `rest_${restId}`;
          if (markersRef.current[restKey]) continue; // already exists

          let pos = null;
          if (r.address) pos = await geocodeAddress(r.address);
          if (!pos) pos = SAMPLE_LOCATIONS.restaurant1;

          try {
            const restIconUrl = getRestaurantIcon(44, '#34A853');
            const restMarker = new window.google.maps.Marker({
              position: pos,
              map: googleMapRef.current,
              title: r.name || `Nhà hàng #${restId}`,
              icon: {
                url: restIconUrl,
                scaledSize: new window.google.maps.Size(44, 44),
                anchor: new window.google.maps.Point(22, 44),
              },
            });

            const safeName = (r.name || 'Nhà hàng').replace(/</g, '&lt;');
            const safeAddr = (r.address || 'Không rõ địa chỉ').replace(/</g, '&lt;');
            const restInfo = new window.google.maps.InfoWindow({
              content: `
                <div style="padding:10px;">
                  <h4 style="margin:0 0 6px 0;">${safeName}</h4>
                  <div style="font-size:13px;color:#444;">${safeAddr}</div>
                </div>
              `,
            });

            restMarker.addListener('click', () => restInfo.open(googleMapRef.current, restMarker));
            markersRef.current[restKey] = { marker: restMarker, infoWindow: restInfo };
          } catch (e) {
            console.warn('Không thể thêm marker nhà hàng:', e);
          }
        }
      } catch (e) {
        console.warn('Lỗi khi tải danh sách nhà hàng:', e);
      }
    };

    loadRestaurants();

    return () => { active = false; };
  }, [mapReady]);

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 18, height: 18, background: '#34A853', borderRadius: '50%', border: '2px solid #fff' }} />
              <span style={{ fontSize: 14 }}>Nhà hàng</span>
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
