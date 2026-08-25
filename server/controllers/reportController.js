const Report = require('../models/Report');

// @desc    Submit a user report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res) => {
  try {
    const { reportedUser, reason, conversation, message } = req.body;
    const reporter = req.user._id;

    if (!reportedUser || !reason) {
      return res.status(400).json({ message: 'Reported user ID and reason are required' });
    }

    const report = await Report.create({
      reporter,
      reportedUser,
      reason: reason.trim(),
      conversation: conversation || null,
      message: message || null,
    });

    res.status(201).json({ message: 'Report submitted successfully. Thank you for making PulseChat safer.', report });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error submitting report' });
  }
};

module.exports = { createReport };
