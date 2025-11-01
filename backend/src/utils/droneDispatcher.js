"use strict";

// Simple background dispatcher that assigns available drones to accepted orders without a drone
// Runs periodically and tries to pair the oldest eligible order with an available drone.

const { sequelize } = require('../config/db');
const { Order, Drone } = require('../models');

let intervalHandle = null;
let isTickRunning = false;

async function attemptAssignOne() {
  let assigned = false;
  await sequelize.transaction(async (t) => {
    // Oldest order that is accepted but has no drone yet
    const order = await Order.findOne({
      where: { status: 'Accepted', droneId: null },
      order: [['createdAt', 'ASC']],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!order) return; // nothing to do

    // Find an available drone
    const drone = await Drone.findOne({
      where: { status: 'available' },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!drone) return; // no drone available right now

    // Reserve drone and assign to order
    drone.status = 'busy';
    await drone.save({ transaction: t });

    order.droneId = drone.id;
    // Keep status as 'Accepted'. 'Delivering' should be set by delivery start logic if applicable.
    await order.save({ transaction: t });

    assigned = true;
    console.log(`[Dispatcher] Assigned drone #${drone.id} -> order #${order.id}`);
  });
  return assigned;
}

function startDroneDispatcher({ intervalMs = 5000, burst = 3 } = {}) {
  if (intervalHandle) return; // already running
  intervalHandle = setInterval(async () => {
    if (isTickRunning) return; // avoid overlapping ticks
    isTickRunning = true;
    try {
      for (let i = 0; i < burst; i++) {
        const didAssign = await attemptAssignOne();
        if (!didAssign) break; // nothing to assign right now
      }
    } catch (e) {
      console.error('[Dispatcher] Error in tick:', e?.message || e);
    } finally {
      isTickRunning = false;
    }
  }, intervalMs);
  console.log(`[Dispatcher] Drone dispatcher started. Interval: ${intervalMs}ms, burst: ${burst}`);
}

function stopDroneDispatcher() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    console.log('[Dispatcher] Drone dispatcher stopped.');
  }
}

module.exports = { startDroneDispatcher, stopDroneDispatcher };
