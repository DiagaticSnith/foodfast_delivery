const { OrderDetail, Menu } = require('../models');

exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const details = await OrderDetail.findAll({
      where: { orderId },
      include: [{ model: Menu }],
    });
    res.json(details);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
