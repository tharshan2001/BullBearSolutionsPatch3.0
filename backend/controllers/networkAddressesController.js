import NetworkAddresses from '../models/NetworkAddress.js';

// Save a new set of addresses
export const saveNetworkAddresses = async (req, res) => {
  try {
    const data = req.body;

    const newEntry = new NetworkAddresses(data);
    await newEntry.save();

    res.status(201).json({
      message: 'Network addresses saved successfully',
      data: newEntry,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to save network addresses',
      error: error.message,
    });
  }
};

// Get the last saved addresses
export const getLastNetworkAddresses = async (req, res) => {
  try {
    const lastEntry = await NetworkAddresses.findOne().sort({ createdAt: -1 });

    if (!lastEntry) {
      return res.status(404).json({ message: 'No addresses found' });
    }

    res.status(200).json(lastEntry);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch latest network addresses',
      error: error.message,
    });
  }
};
