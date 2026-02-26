const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

// READ (View Receipt by Order ID)
router.get('/:orderId', async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE (Update Status - e.g., Pending to Completed)
router.put('/:id/status', async (req, res) => {
  try {
    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: req.body.paymentStatus },
      { new: true }
    );
    res.json(updatedPayment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE (Void Transaction)
router.delete('/:id', async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaction voided successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;