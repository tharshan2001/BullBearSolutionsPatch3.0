import HelpCenter from '../models/HelpCenter.js';

// Create a new help center message
export const createMessage = async (req, res) => {
  try {
    const { FullName, mailid, message } = req.body;
    const newMessage = await HelpCenter.create({ FullName, mailid, message });
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create message.' });
  }
};

// Get all messages
export const getAllMessages = async (req, res) => {
  try {
    const messages = await HelpCenter.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
};

// Mark a message as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMessage = await HelpCenter.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );
    if (!updatedMessage) {
      return res.status(404).json({ error: 'Message not found.' });
    }
    res.status(200).json(updatedMessage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update message.' });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMessage = await HelpCenter.findByIdAndDelete(id);
    if (!deletedMessage) {
      return res.status(404).json({ error: 'Message not found.' });
    }
    res.status(200).json({ message: 'Message deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete message.' });
  }
};
