exports.createDrone = async (req, res) => {
  try {
    const { name, status, launchpad } = req.body;
    const drone = await Drone.create({ name, status, launchpad });
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
