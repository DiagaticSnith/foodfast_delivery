exports.createDrone = async (req, res) => {
  try {
    const { name, status, userId } = req.body;
    const drone = await Drone.create({ name, status, userId });
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
    res.status(500).json({ error: err.message });
  }
};
