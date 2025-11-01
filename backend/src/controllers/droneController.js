exports.createDrone = async (req, res) => {
  try {
    const { name, status, launchpad, battery } = req.body;
    const drone = await Drone.create({ name, status, launchpad, battery });
    res.status(201).json(drone);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
const { Drone } = require('../models');

exports.getAllDrones = async (req, res) => {
  try {
    const drones = await Drone.findAll();
    res.json(drones);
  } catch (err) {
    console.error('Error in getAllDrones:', err); // Log chi tiết lỗi
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};

// Cập nhật một drone theo id
exports.updateDrone = async (req, res) => {
  try {
    const { id } = req.params;
    const drone = await Drone.findByPk(id);
    if (!drone) return res.status(404).json({ error: 'Drone not found' });

    const { name, status, launchpad, battery } = req.body;
    // Chỉ cập nhật các trường được cung cấp
    if (name !== undefined) drone.name = name;

    // Business rule: admin API must NOT set drone to 'busy' (bận).
    // 'busy' is reserved for system assignment. Only allow changing
    // status to 'maintenance' from an 'available' drone, or back to 'available'.
    if (status !== undefined) {
      const normalized = String(status).toLowerCase();
      if (normalized === 'busy') {
        return res.status(400).json({ error: 'Cannot set status to "busy" via API; this is system-managed.' });
      }
      if (normalized === 'maintenance') {
        if (drone.status !== 'available') {
          return res.status(400).json({ error: 'Can only set status to "maintenance" when drone is currently "available".' });
        }
        drone.status = 'maintenance';
      } else if (normalized === 'available') {
        // allow returning from maintenance to available
        drone.status = 'available';
      } else {
        return res.status(400).json({ error: `Invalid status value: ${status}` });
      }
    }

    if (launchpad !== undefined) drone.launchpad = launchpad;
    if (battery !== undefined) drone.battery = battery;

    await drone.save();
    res.json(drone);
  } catch (err) {
    console.error('Error in updateDrone:', err);
    res.status(400).json({ error: err.message });
  }
};

// Xoá một drone (hard delete)
exports.deleteDrone = async (req, res) => {
  try {
    const { id } = req.params;
    const drone = await Drone.findByPk(id);
    if (!drone) return res.status(404).json({ error: 'Drone not found' });

    await drone.destroy();
    // 204 No Content
    res.status(204).end();
  } catch (err) {
    console.error('Error in deleteDrone:', err);
    res.status(500).json({ error: err.message });
  }
};
