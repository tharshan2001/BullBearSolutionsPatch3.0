// controllers/premiumPlanController.js
import PremiumPlan from '../models/PremiumPlan.js';

export const saveNewPlan = async (req, res) => {
  try {
    const newPlan = new PremiumPlan(req.body);
    await newPlan.save();
    res.status(201).json({
      success: true,
      data: newPlan,
      message: 'New premium plan saved successfully!',
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getLastSavedPlan = async (req, res) => {
  try {
    const lastPlan = await PremiumPlan.findOne().sort({ createdAt: -1 });
    if (!lastPlan) {
      return res.status(404).json({
        success: false,
        message: 'No premium plans found.',
      });
    }
    res.json({ success: true, data: lastPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
