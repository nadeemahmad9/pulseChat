const User = require('../models/User');

// @desc    Update user profile details
// @route   PATCH /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, username, bio, about, avatar, phone } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username && username.toLowerCase().trim() !== user.username) {
      const existing = await User.findOne({ username: username.toLowerCase().trim() });
      if (existing) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      user.username = username.toLowerCase().trim();
    }

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (about !== undefined) user.about = about.trim();
    if (avatar !== undefined) user.avatar = avatar;
    if (phone !== undefined) user.phone = phone ? phone.trim() : undefined;

    await user.save();

    const updatedUser = await User.findById(userId).select('-password');
    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating profile' });
  }
};

// @desc    Update privacy settings
// @route   PATCH /api/users/privacy
// @access  Private
const updatePrivacySettings = async (req, res) => {
  try {
    const { lastSeen, profilePhoto, about, readReceipts } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (lastSeen) user.privacySettings.lastSeen = lastSeen;
    if (profilePhoto) user.privacySettings.profilePhoto = profilePhoto;
    if (about) user.privacySettings.about = about;
    if (readReceipts !== undefined) user.privacySettings.readReceipts = readReceipts;

    await user.save();

    res.status(200).json({ message: 'Privacy settings updated', privacySettings: user.privacySettings });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating privacy settings' });
  }
};

// @desc    Search users by name, username, email, or phone
// @route   GET /api/users/search
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(200).json({ users: [] });
    }

    const query = q.trim();
    const regex = new RegExp(query, 'i');

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { name: regex },
        { username: regex },
        { email: regex },
        { phone: regex },
      ],
    })
      .select('name username email phone avatar bio isOnline lastSeen')
      .limit(20);

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error searching users' });
  }
};

// @desc    Block a user
// @route   POST /api/users/block/:userId
// @access  Private
const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({ message: 'You cannot block yourself' });
    }

    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      return res.status(404).json({ message: 'User to block not found' });
    }

    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { blockedUsers: userId },
    });

    res.status(200).json({ message: `Blocked user ${userToBlock.name}` });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error blocking user' });
  }
};

// @desc    Unblock a user
// @route   POST /api/users/unblock/:userId
// @access  Private
const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { blockedUsers: userId },
    });

    res.status(200).json({ message: 'Unblocked user successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error unblocking user' });
  }
};

module.exports = {
  updateProfile,
  updatePrivacySettings,
  searchUsers,
  blockUser,
  unblockUser,
};
