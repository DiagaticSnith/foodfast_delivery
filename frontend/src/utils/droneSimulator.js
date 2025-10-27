// Drone movement simulator for demo purposes
// Simulates drone traveling from restaurant to customer address

/**
 * Generate a route with intermediate points between two locations
 * In production, you'd use Google Directions API
 */
export const generateRoute = (start, end, steps = 20) => {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = start.lat + (end.lat - start.lat) * t;
    const lng = start.lng + (end.lng - start.lng) * t;
    points.push({ lat, lng });
  }
  return points;
};

/**
 * Calculate bearing (direction) between two points
 */
export const calculateBearing = (start, end) => {
  const lat1 = (start.lat * Math.PI) / 180;
  const lat2 = (end.lat * Math.PI) / 180;
  const lng1 = (start.lng * Math.PI) / 180;
  const lng2 = (end.lng * Math.PI) / 180;
  
  const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);
  const bearing = Math.atan2(y, x);
  
  return ((bearing * 180) / Math.PI + 360) % 360;
};

/**
 * Interpolate between two points
 */
export const interpolate = (start, end, t) => {
  return {
    lat: start.lat + (end.lat - start.lat) * t,
    lng: start.lng + (end.lng - start.lng) * t,
  };
};

/**
 * Drone Simulator class
 * Simulates a drone moving along a route with realistic updates
 */
export class DroneSimulator {
  /**
   * @param {number|string} droneId
   * @param {{lat:number,lng:number}[]} route
   * @param {number|object} speedOrOptions - speed or options
   *    If object: { mode: 'time', startTimeMs: number, durationMs: number, tickHz?: number }
   */
  constructor(droneId, route, speedOrOptions = 100) {
    this.droneId = droneId;
    this.route = route; // Array of {lat, lng}
    this.currentIndex = 0;
    this.progress = 0; // 0-1 between current and next point
    this.isRunning = false;
    this.listeners = [];
    this.intervalId = null;

    // Modes: 'step' (legacy) or 'time' (deterministic by timestamp)
    if (typeof speedOrOptions === 'object') {
      const { mode = 'time', startTimeMs, durationMs, tickHz = 30 } = speedOrOptions || {};
      this.mode = mode;
      this.startTimeMs = startTimeMs ?? Date.now();
      this.durationMs = durationMs ?? 120000; // default 2 minutes
      this.tickHz = tickHz;
      this.speed = this.tickHz; // for interval
    } else {
      this.mode = 'step';
      this.speed = speedOrOptions; // Updates per second (higher = faster)
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    // Make an immediate update so UI reflects current time instantly
    this.update();
    this.intervalId = setInterval(() => {
      this.update();
    }, 1000 / (this.speed || 30));
  }

  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  update() {
    const totalSegments = Math.max(1, this.route.length - 1);

    if (this.mode === 'time') {
      const now = Date.now();
      const elapsed = Math.max(0, now - (this.startTimeMs || now));
      const tGlobal = Math.min(1, elapsed / (this.durationMs || 1)); // 0..1
      const exact = tGlobal * totalSegments; // e.g., 3.25 segments
      this.currentIndex = Math.min(totalSegments - 1, Math.floor(exact));
      this.progress = exact - this.currentIndex;

      const current = this.route[this.currentIndex];
      const next = this.route[Math.min(this.currentIndex + 1, this.route.length - 1)];
      const position = interpolate(current, next, isNaN(this.progress) ? 0 : this.progress);
      const bearing = calculateBearing(current, next);

      const update = {
        droneId: this.droneId,
        position,
        bearing,
        currentIndex: this.currentIndex,
        totalPoints: this.route.length,
        progress: tGlobal, // overall 0..1
        completed: tGlobal >= 1,
      };
      this.notifyListeners(update);
      if (tGlobal >= 1) {
        this.stop();
      }
      return;
    }

    // Legacy step mode (kept for compatibility)
    if (this.currentIndex >= this.route.length - 1 && this.progress >= 1) {
      const lastPosition = this.route[this.route.length - 1];
      const update = {
        droneId: this.droneId,
        position: lastPosition,
        bearing: 0,
        currentIndex: this.route.length - 1,
        totalPoints: this.route.length,
        progress: 1,
        completed: true,
      };
      this.notifyListeners(update);
      this.stop();
      return;
    }

    this.progress += 0.01; // Increment by 1% each update
    if (this.progress >= 1) {
      this.progress = 0;
      this.currentIndex++;
      if (this.currentIndex >= this.route.length - 1) {
        this.currentIndex = this.route.length - 1;
        this.progress = 1;
      }
    }

    const current = this.route[this.currentIndex];
    const next = this.route[Math.min(this.currentIndex + 1, this.route.length - 1)];
    const position = interpolate(current, next, this.progress);
    const bearing = calculateBearing(current, next);
    const update = {
      droneId: this.droneId,
      position,
      bearing,
      currentIndex: this.currentIndex,
      totalPoints: this.route.length,
      progress: (this.currentIndex + this.progress) / this.route.length,
      completed: false,
    };
    this.notifyListeners(update);
  }

  onUpdate(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners(update) {
    this.listeners.forEach(listener => listener(update));
  }

  reset() {
    this.currentIndex = 0;
    this.progress = 0;
  }

  getCurrentPosition() {
    if (this.currentIndex >= this.route.length) {
      return this.route[this.route.length - 1];
    }
    const current = this.route[this.currentIndex];
    const next = this.route[this.currentIndex + 1] || current;
    return interpolate(current, next, this.progress);
  }
}

/**
 * Sample locations in Ho Chi Minh City for demo
 */
export const SAMPLE_LOCATIONS = {
  // Restaurant locations
  restaurant1: { lat: 10.7756, lng: 106.7019, name: 'Nhà hàng 1 (Quận 1)' },
  restaurant2: { lat: 10.8231, lng: 106.6297, name: 'Nhà hàng 2 (Quận Tân Bình)' },
  
  // Customer locations
  customer1: { lat: 10.7892, lng: 106.6989, name: 'Khách hàng 1 (Quận 3)' },
  customer2: { lat: 10.8542, lng: 106.6291, name: 'Khách hàng 2 (Quận Phú Nhuận)' },
  customer3: { lat: 10.7625, lng: 106.6820, name: 'Khách hàng 3 (Quận 1)' },
  
  // Center of map
  center: { lat: 10.7769, lng: 106.7009, name: 'TP.HCM' },
};
