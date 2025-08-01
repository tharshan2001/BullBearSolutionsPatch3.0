import Config from '../models/Config.js';

// Helper function to validate levelRates object
const isValidLevelRates = (levelRates) => {
  if (typeof levelRates !== 'object' || levelRates === null) return false;
  for (const [key, value] of Object.entries(levelRates)) {
    if (isNaN(Number(key)) || typeof value !== 'number' || value < 0 || value > 1) {
      return false;
    }
  }
  return true;
};

// Get single (latest) config
export const getConfig = async (req, res) => {
  try {
    const config = await Config.findOne().sort({ _id: -1 });
    if (!config) {
      return res.status(404).json({ message: "Config not found" });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create config
export const createConfig = async (req, res) => {
  try {
    const existing = await Config.findOne();
    if (existing) {
      return res.status(400).json({ message: "Config already exists" });
    }

    const { levelRates, directCommissionRate, commissionPercentage } = req.body;

    // Validate inputs
    if (!isValidLevelRates(levelRates)) {
      return res.status(400).json({ message: "Invalid levelRates format" });
    }
    if (typeof directCommissionRate !== 'number' || directCommissionRate < 0 || directCommissionRate > 1) {
      return res.status(400).json({ message: "Invalid directCommissionRate" });
    }
    if (typeof commissionPercentage !== 'number' || commissionPercentage < 0 || commissionPercentage > 1) {
      return res.status(400).json({ message: "Invalid commissionPercentage" });
    }

    const config = new Config({ levelRates, directCommissionRate, commissionPercentage });

    await config.save();
    res.status(201).json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update config
export const updateConfig = async (req, res) => {
  try {
    const config = await Config.findOne();
    if (!config) {
      return res.status(404).json({ message: "Config not found" });
    }

    const { levelRates, directCommissionRate, commissionPercentage } = req.body;

    if (levelRates !== undefined) {
      if (!isValidLevelRates(levelRates)) {
        return res.status(400).json({ message: "Invalid levelRates format" });
      }
      config.levelRates = levelRates;
    }

    if (directCommissionRate !== undefined) {
      if (typeof directCommissionRate !== 'number' || directCommissionRate < 0 || directCommissionRate > 1) {
        return res.status(400).json({ message: "Invalid directCommissionRate" });
      }
      config.directCommissionRate = directCommissionRate;
    }

    if (commissionPercentage !== undefined) {
      if (typeof commissionPercentage !== 'number' || commissionPercentage < 0 || commissionPercentage > 1) {
        return res.status(400).json({ message: "Invalid commissionPercentage" });
      }
      config.commissionPercentage = commissionPercentage;
    }

    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all configs
export const getAllConfigs = async (req, res) => {
  try {
    const configs = await Config.find();
    if (!configs || configs.length === 0) {
      return res.status(404).json({ message: "No configs found" });
    }
    res.json(configs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete config
export const deleteConfig = async (req, res) => {
  try {
    const { id } = req.params;

    const config = await Config.findById(id);
    if (!config) {
      return res.status(404).json({ message: "Config not found" });
    }

    await Config.findByIdAndDelete(id);

    res.json({ message: "Config deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
