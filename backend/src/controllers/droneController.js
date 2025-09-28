const { Drone } = require('../models');

exports.getAllDrones = async (req, res) => {
  try {
    const drones = await Drone.findAll();
    res.json(drones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
